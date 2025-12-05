import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, Switch, FlatList, Alert, Dimensions, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

export default function App() {
  // Game state
  const [gameState, setGameState] = useState('setup'); // setup, playing, finished
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', score: 0, color: PLAYER_COLORS[0] },
    { id: 2, name: 'Player 2', score: 0, color: PLAYER_COLORS[1] },
  ]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  // UI state
  const [setupModal, setSetupModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [settingsModal, setSettingsModal] = useState(false);
  const [statsModal, setStatsModal] = useState(false);

  const timerIntervalRef = useRef(null);
  const undoStackRef = useRef([]);

  // Timer effect
  useEffect(() => {
    if (timerActive && gameState === 'playing') {
      timerIntervalRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, gameState]);

  // Persistence
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('@gsa_state');
        if (saved) {
          const data = JSON.parse(saved);
          setPlayers(data.players || players);
          setGameHistory(data.history || []);
          setDarkTheme(data.darkTheme ?? true);
        }
      } catch (e) {
        console.warn('Failed to load state', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('@gsa_state', JSON.stringify({ players, gameHistory, darkTheme }));
      } catch (e) {
        console.warn('Failed to save state', e);
      }
    })();
  }, [players, gameHistory, darkTheme]);

  // Actions
  const addScore = (playerId, amount) => {
    Haptics.selectionAsync();
    setPlayers((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((p) => p.id === playerId);
      if (idx >= 0) {
        undoStackRef.current.push([...updated]);
        updated[idx].score += amount;
      }
      return updated;
    });
  };

  const undo = () => {
    const prev = undoStackRef.current.pop();
    if (prev) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPlayers(prev);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const addPlayer = () => {
    if (!newPlayerName.trim() || players.length >= 6) return;
    const newId = Math.max(...players.map((p) => p.id), 0) + 1;
    const newPlayer = {
      id: newId,
      name: newPlayerName,
      score: 0,
      color: PLAYER_COLORS[players.length % PLAYER_COLORS.length],
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    Haptics.selectionAsync();
  };

  const removePlayer = (id) => {
    if (players.length <= 1) return;
    setPlayers(players.filter((p) => p.id !== id));
    if (currentTurn >= players.length - 1) setCurrentTurn(0);
  };

  const startGame = () => {
    setFinalResult(null);
    setGameState('playing');
    setRound(1);
    setTimeElapsed(0);
    setCurrentTurn(0);
    setTimerActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const endGame = () => {
    setTimerActive(false);

    const topScore = players.length ? Math.max(...players.map((p) => p.score)) : 0;
    const leaders = players.filter((p) => p.score === topScore);
    const winnerNames = leaders.map((p) => p.name);

    setFinalResult({
      winners: leaders.map((p) => ({ ...p })),
      topScore,
      isTie: winnerNames.length > 1,
    });

    setGameHistory((h) => [
      ...h,
      {
        id: Date.now(),
        players: players.map((p) => ({ ...p })),
        winners: winnerNames,
        topScore,
        result: winnerNames.length > 1 ? 'tie' : 'winner',
        timestamp: new Date().toLocaleString(),
        duration: timeElapsed,
        round,
      },
    ]);

    setGameState('finished');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const goToSetup = () => {
    setFinalResult(null);
    setGameState('setup');
  };

  const resetGame = () => {
    Alert.alert('Reset Game', 'Start a new game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New Game',
        onPress: () => {
          setPlayers(players.map((p) => ({ ...p, score: 0 })));
          setGameState('setup');
          setRound(1);
          setTimeElapsed(0);
          setCurrentTurn(0);
          undoStackRef.current = [];
          setFinalResult(null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Responsive layout
  const numPlayers = players.length;
  const playerColsCount = numPlayers <= 2 ? 2 : numPlayers <= 4 ? 2 : 3;
  const playerCardWidth = (width - 40) / playerColsCount;

  if (gameState === 'setup') {
    return (
      <View style={[styles.container, darkTheme ? styles.darkBg : styles.lightBg]}>
        <LinearGradient
          colors={darkTheme ? ['#1a1a2e', '#16213e'] : ['#f5f7fa', '#e9ecef']}
          style={styles.gradient}
        >
          <StatusBar style={darkTheme ? 'light' : 'dark'} />
          
          <View style={styles.setupHeader}>
            <MaterialIcons name="casino" size={48} color={darkTheme ? '#fff' : '#333'} />
            <Text style={[styles.title, darkTheme ? styles.textLight : styles.textDark]}>Game Scoreboard</Text>
            <Text style={[styles.subtitle, darkTheme ? styles.textLightSub : styles.textDarkSub]}>Add players and start playing</Text>
          </View>

          <ScrollView style={styles.setupContent} contentContainerStyle={styles.setupContentInner}>
            <View style={styles.playerList}>
              {players.map((player) => (
                <View key={player.id} style={styles.setupPlayerItem}>
                  <View style={[styles.playerColorDot, { backgroundColor: player.color }]} />
                  <Text style={[styles.setupPlayerName, darkTheme ? styles.textLight : styles.textDark]}>{player.name}</Text>
                  {players.length > 1 && (
                    <TouchableOpacity onPress={() => removePlayer(player.id)} style={styles.removeBtn}>
                      <MaterialIcons name="close" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {players.length < 6 && (
              <View style={styles.addPlayerSection}>
                <TextInput
                  style={[styles.playerInput, darkTheme ? styles.inputDark : styles.inputLight]}
                  placeholder="Enter player name"
                  placeholderTextColor={darkTheme ? '#999' : '#ccc'}
                  value={newPlayerName}
                  onChangeText={setNewPlayerName}
                  onSubmitEditing={addPlayer}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addPlayer}>
                  <MaterialIcons name="add" size={24} color="#fff" />
                  <Text style={styles.addBtnText}>Add Player</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.setupActions}>
              <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                <MaterialIcons name="play-arrow" size={28} color="#fff" />
                <Text style={styles.startBtnText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  if (gameState === 'finished') {
    const computedWinners = (() => {
      if (finalResult?.winners?.length) {
        return finalResult.winners;
      }
      if (!players.length) return [];
      const top = Math.max(...players.map((p) => p.score));
      return players.filter((p) => p.score === top);
    })();

    const topScore = finalResult?.topScore ?? (computedWinners[0]?.score ?? 0);
    const isTie = finalResult?.isTie ?? computedWinners.length > 1;
    const primaryWinner = computedWinners[0];

    return (
      <View style={[styles.container, darkTheme ? styles.darkBg : styles.lightBg]}>
        <LinearGradient colors={darkTheme ? ['#1a1a2e', '#16213e'] : ['#f5f7fa', '#e9ecef']} style={styles.gradient}>
          <StatusBar style={darkTheme ? 'light' : 'dark'} />
          
          <ScrollView contentContainerStyle={styles.finishedContent}>
            <View style={styles.finishedHeader}>
              <MaterialIcons name="emoji-events" size={64} color="#FFD700" />
              <Text style={[styles.finishedTitle, darkTheme ? styles.textLight : styles.textDark]}>Game Over!</Text>
              {isTie ? (
                <>
                  <Text style={[styles.winnerName, darkTheme ? styles.textLight : styles.textDark]}>It's a tie!</Text>
                  <Text style={[styles.winnerScore, darkTheme ? styles.textLightSub : styles.textDarkSub]}>Top Score: {topScore}</Text>
                  <View style={styles.tieNames}>
                    {computedWinners.map((winner) => (
                      <Text key={winner.id} style={[styles.tieName, { color: winner.color }]}>
                        {winner.name}
                      </Text>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.winnerName, { color: primaryWinner?.color ?? '#fff' }]}>{primaryWinner?.name ?? 'Winner'} Wins!</Text>
                  <Text style={[styles.winnerScore, darkTheme ? styles.textLightSub : styles.textDarkSub]}>Score: {primaryWinner?.score ?? topScore}</Text>
                </>
              )}
            </View>

            <View style={styles.finalScores}>
              {players.map((player) => (
                <View key={player.id} style={styles.finalScoreItem}>
                  <View style={[styles.playerColorDot, { backgroundColor: player.color, width: 16, height: 16 }]} />
                  <Text style={[styles.finalPlayerName, darkTheme ? styles.textLight : styles.textDark]}>{player.name}</Text>
                  <Text style={[styles.finalScore, darkTheme ? styles.textLight : styles.textDark]}>{player.score}</Text>
                </View>
              ))}
            </View>

            <View style={styles.gameStats}>
              <Text style={[styles.statLabel, darkTheme ? styles.textLight : styles.textDark]}>Duration: {formatTime(timeElapsed)}</Text>
              <Text style={[styles.statLabel, darkTheme ? styles.textLight : styles.textDark]}>Rounds Played: {round}</Text>
            </View>

            <View style={styles.finishedActions}>
              <TouchableOpacity style={styles.newGameBtn} onPress={resetGame}>
                <MaterialIcons name="add-circle" size={24} color="#fff" />
                <Text style={styles.newGameBtnText}>New Game</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editBtn} onPress={goToSetup}>
                <MaterialIcons name="edit" size={24} color="#fff" />
                <Text style={styles.editBtnText}>Edit Players</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // Playing state
  return (
    <View style={[styles.container, darkTheme ? styles.darkBg : styles.lightBg, fullscreenMode && styles.fullscreen]}>
      <LinearGradient colors={darkTheme ? ['#1a1a2e', '#16213e'] : ['#f5f7fa', '#e9ecef']} style={styles.gradient}>
        <StatusBar style={darkTheme ? 'light' : 'dark'} hidden={fullscreenMode} />

        {!fullscreenMode && (
          <View style={styles.playingHeader}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.headerBtn} onPress={undo}>
                <MaterialIcons name="undo" size={24} color={darkTheme ? '#fff' : '#333'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setShowStats(!showStats)}>
                <MaterialIcons name="bar-chart" size={24} color={darkTheme ? '#fff' : '#333'} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerCenter}>
              <View style={styles.roundInfo}>
                <Text style={[styles.roundLabel, darkTheme ? styles.textLight : styles.textDark]}>Round {round}</Text>
              </View>
              <View style={styles.timerDisplay}>
                <MaterialIcons name="schedule" size={16} color={darkTheme ? '#fff' : '#333'} />
                <Text style={[styles.timerText, darkTheme ? styles.textLight : styles.textDark]}>{formatTime(timeElapsed)}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setFullscreenMode(true)}>
                <MaterialIcons name="fullscreen" size={24} color={darkTheme ? '#fff' : '#333'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setSettingsModal(true)}>
                <MaterialIcons name="settings" size={24} color={darkTheme ? '#fff' : '#333'} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[styles.playingContent, fullscreenMode && styles.fullscreenContent]}>
          <View style={[styles.playerGrid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {players.map((player, idx) => (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.playerCard,
                  { backgroundColor: player.color, opacity: currentTurn === idx ? 1 : 0.7 },
                  { width: playerCardWidth, marginHorizontal: 5, marginVertical: 8 },
                ]}
                activeOpacity={0.8}
                onPress={() => addScore(player.id, 1)}
              >
                {currentTurn === idx && (
                  <View style={styles.turnIndicator}>
                    <MaterialIcons name="star" size={20} color="#FFD700" />
                    <Text style={styles.turnText}>Your Turn</Text>
                  </View>
                )}

                <Text style={styles.playerCardName}>{player.name}</Text>

                <View style={styles.scoreDisplay}>
                  <Text style={styles.scoreValue}>{player.score}</Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.scoreAdjustBtn, styles.minusBtn]}
                    onPress={() => addScore(player.id, -1)}
                  >
                    <MaterialIcons name="remove" size={20} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.scoreAdjustBtn, styles.plusBtn]}
                    onPress={() => addScore(player.id, 1)}
                  >
                    <MaterialIcons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {!fullscreenMode && (
          <View style={styles.playingFooter}>
            <TouchableOpacity style={styles.footerBtn} onPress={() => { setRound(r => r + 1); setCurrentTurn(0); Haptics.selectionAsync(); }}>
              <MaterialIcons name="arrow-forward" size={24} color="#fff" />
              <Text style={styles.footerBtnText}>Next Round</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.footerBtn, styles.endBtn]} onPress={endGame}>
              <MaterialIcons name="stop-circle" size={24} color="#fff" />
              <Text style={styles.footerBtnText}>End Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {fullscreenMode && (
          <TouchableOpacity style={styles.exitFullscreen} onPress={() => setFullscreenMode(false)}>
            <MaterialIcons name="fullscreen-exit" size={32} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Settings Modal */}
        <Modal visible={settingsModal} animationType="slide" transparent onRequestClose={() => setSettingsModal(false)}>
          <View style={[styles.modalOverlay, darkTheme ? styles.darkBg : styles.lightBg]}>
            <View style={[styles.modalContent, darkTheme ? { backgroundColor: '#16213e' } : { backgroundColor: '#fff' }]}>
              <Text style={[styles.modalTitle, darkTheme ? styles.textLight : styles.textDark]}>Settings</Text>

              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, darkTheme ? styles.textLight : styles.textDark]}>Dark Theme</Text>
                <Switch value={darkTheme} onValueChange={setDarkTheme} />
              </View>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSettingsModal(false)}>
                <Text style={styles.closeModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Stats Modal */}
        <Modal visible={showStats} animationType="fade" transparent onRequestClose={() => setShowStats(false)}>
          <View style={[styles.modalOverlay, darkTheme ? styles.darkBg : styles.lightBg]}>
            <View style={[styles.modalContent, darkTheme ? { backgroundColor: '#16213e' } : { backgroundColor: '#fff' }]}>
              <Text style={[styles.modalTitle, darkTheme ? styles.textLight : styles.textDark]}>Game Stats</Text>

              {players.map((player) => (
                <View key={player.id} style={styles.statsItemContainer}>
                  <View style={[styles.playerColorDot, { backgroundColor: player.color }]} />
                  <View style={styles.statsItemContent}>
                    <Text style={[styles.statsItemName, darkTheme ? styles.textLight : styles.textDark]}>{player.name}</Text>
                    <Text style={[styles.statsItemScore, darkTheme ? styles.textLight : styles.textDark]}>Score: {player.score}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowStats(false)}>
                <Text style={styles.closeModalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  darkBg: { backgroundColor: '#0f0f1e' },
  lightBg: { backgroundColor: '#f5f7fa' },
  textLight: { color: '#fff' },
  textDark: { color: '#333' },
  textLightSub: { color: 'rgba(255,255,255,0.7)' },
  textDarkSub: { color: 'rgba(0,0,0,0.6)' },

  // Setup Screen
  setupHeader: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  title: { fontSize: 32, fontWeight: '800', marginTop: 10 },
  subtitle: { fontSize: 16, marginTop: 8 },
  setupContent: { flex: 1 },
  setupContentInner: { paddingHorizontal: 20, paddingBottom: 40 },
  playerList: { marginBottom: 24 },
  setupPlayerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, marginBottom: 8 },
  playerColorDot: { width: 20, height: 20, borderRadius: 10, marginRight: 12 },
  setupPlayerName: { flex: 1, fontSize: 16, fontWeight: '600' },
  removeBtn: { padding: 8 },
  addPlayerSection: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 24 },
  playerInput: { padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1 },
  inputDark: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' },
  inputLight: { backgroundColor: '#fff', borderColor: '#ddd', color: '#333' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2d9cdb', paddingVertical: 12, borderRadius: 8 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  setupActions: { marginTop: 20 },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#27ae60', paddingVertical: 16, borderRadius: 12 },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', marginLeft: 8 },

  // Playing Screen
  playingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', gap: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  roundInfo: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, marginBottom: 4 },
  roundLabel: { fontSize: 12, fontWeight: '700' },
  timerDisplay: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerText: { fontSize: 14, fontWeight: '700' },
  playingContent: { flex: 1, paddingHorizontal: 10, justifyContent: 'center' },
  fullscreenContent: { paddingHorizontal: 0 },
  playerGrid: { justifyContent: 'center' },
  playerCard: { borderRadius: 16, padding: 16, overflow: 'hidden' },
  turnIndicator: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  turnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  playerCardName: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  scoreDisplay: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, paddingVertical: 8, marginBottom: 12, alignItems: 'center' },
  scoreValue: { color: '#fff', fontSize: 36, fontWeight: '800' },
  cardActions: { flexDirection: 'row', gap: 8 },
  scoreAdjustBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  minusBtn: { backgroundColor: 'rgba(0,0,0,0.3)' },
  plusBtn: { backgroundColor: 'rgba(255,255,255,0.3)' },

  // Finished Screen
  finishedContent: { paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' },
  finishedHeader: { alignItems: 'center', marginBottom: 40 },
  finishedTitle: { fontSize: 28, fontWeight: '800', marginVertical: 12 },
  winnerName: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  winnerScore: { fontSize: 18 },
  tieNames: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  tieName: { fontSize: 16, fontWeight: '700' },
  finalScores: { width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, borderRadius: 12, marginBottom: 24 },
  finalScoreItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  finalPlayerName: { flex: 1, fontSize: 16, fontWeight: '600' },
  finalScore: { fontSize: 18, fontWeight: '700' },
  gameStats: { width: '100%', marginBottom: 32 },
  statLabel: { fontSize: 14, textAlign: 'center', marginVertical: 4 },
  finishedActions: { flexDirection: 'row', gap: 12, width: '100%' },
  newGameBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#27ae60', paddingVertical: 14, borderRadius: 10 },
  newGameBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2d9cdb', paddingVertical: 14, borderRadius: 10 },
  editBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },

  // Footer
  playingFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 24 },
  footerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 12, borderRadius: 10 },
  footerBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  endBtn: { backgroundColor: '#e74c3c' },
  exitFullscreen: { position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 25 },
  fullscreen: { flex: 1 },

  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  statsItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  statsItemContent: { flex: 1 },
  statsItemName: { fontSize: 14, fontWeight: '600' },
  statsItemScore: { fontSize: 12, marginTop: 2 },
  closeModalBtn: { marginTop: 16, paddingVertical: 12, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 8, alignItems: 'center' },
  closeModalBtnText: { color: '#2d9cdb', fontSize: 16, fontWeight: '700' },
});
