import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, Switch, FlatList, Alert, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function App() {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const [darkTheme, setDarkTheme] = useState(true);
  const undoStackRef = useRef([]);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isLandscape = screenWidth > screenHeight;
  const isSmallScreen = screenWidth < 360;

  // Responsive sizing
  const responsive = {
    headerFontSize: isSmallScreen ? 20 : 28,
    playerLabelFontSize: isSmallScreen ? 18 : 22,
    scoreFontSize: isSmallScreen ? 48 : 72,
    buttonSize: isSmallScreen ? 80 : 100,
    buttonIconSize: isSmallScreen ? 32 : 42,
    scoreDisplaySize: isSmallScreen ? 120 : 140,
    modalPadding: isSmallScreen ? 15 : 20,
    modalTitleFontSize: isSmallScreen ? 18 : 22,
  };

  const addScore = (player, amount) => {
    Haptics.selectionAsync();
    const prev = { p1: player1Score, p2: player2Score };
    undoStackRef.current.push(prev);
    const action = { time: Date.now(), player, amount };
    setActionHistory((h) => [action, ...h].slice(0, 50));
    if (player === 1) {
      setPlayer1Score((s) => s + amount);
    } else {
      setPlayer2Score((s) => s + amount);
    }
  };

  const resetScores = () => {
    Alert.alert('Reset Scores', 'Reset both scores to 0?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        undoStackRef.current.push({ p1: player1Score, p2: player2Score });
        setPlayer1Score(0);
        setPlayer2Score(0);
        setActionHistory((h) => [{ time: Date.now(), player: 0, amount: 0, note: 'reset' }, ...h].slice(0,50));
      } }
    ]);
  };

  const undo = () => {
    const last = undoStackRef.current.pop();
    if (!last) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setPlayer1Score(last.p1);
    setPlayer2Score(last.p2);
    setActionHistory((h) => [{ time: Date.now(), player: 0, amount: 0, note: 'undo' }, ...h].slice(0,50));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Persistence
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@bgs_state');
        if (raw) {
          const obj = JSON.parse(raw);
          setPlayer1Score(obj.p1 ?? 0);
          setPlayer2Score(obj.p2 ?? 0);
          setPlayer1Name(obj.p1name ?? 'Player 1');
          setPlayer2Name(obj.p2name ?? 'Player 2');
          setStep(obj.step ?? 1);
          setActionHistory(obj.history ?? []);
          setDarkTheme(obj.dark ?? true);
        }
      } catch (e) {
        console.warn('Failed to load state', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const obj = { p1: player1Score, p2: player2Score, p1name: player1Name, p2name: player2Name, step, history: actionHistory, dark: darkTheme };
        await AsyncStorage.setItem('@bgs_state', JSON.stringify(obj));
      } catch (e) {
        console.warn('Failed to save state', e);
      }
    })();
  }, [player1Score, player2Score, player1Name, player2Name, step, actionHistory, darkTheme]);

  const clearHistory = async () => {
    setActionHistory([]);
    await AsyncStorage.mergeItem('@bgs_state', JSON.stringify({ history: [] }));
  };

  return (
    <View style={[styles.container, darkTheme ? styles.darkBg : styles.lightBg]}>
      <LinearGradient
        colors={darkTheme ? ['#2c3e50', '#34495e'] : ['#ffffff', '#f0f4f8']}
        style={styles.gradient}
      >
        <StatusBar style={darkTheme ? 'light' : 'dark'} />

        <View style={[styles.headerRow, isLandscape && styles.headerRowLandscape]}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="casino" size={isSmallScreen ? 28 : 36} color={darkTheme ? '#fff' : '#333'} />
            <Text style={[styles.headerTitle, darkTheme ? styles.headerTitleLight : styles.headerTitleDark, { fontSize: responsive.headerFontSize }]}>Board Game Scoreboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setHistoryVisible(true)} style={styles.iconBtn}>
              <MaterialIcons name="history" size={isSmallScreen ? 20 : 24} color={darkTheme ? '#fff' : '#333'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.iconBtn}>
              <MaterialIcons name="settings" size={isSmallScreen ? 20 : 24} color={darkTheme ? '#fff' : '#333'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={undo} style={styles.iconBtn}>
              <MaterialIcons name="undo" size={isSmallScreen ? 20 : 24} color={darkTheme ? '#fff' : '#333'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.scoreboardContainer, isLandscape && styles.scoreboardContainerLandscape]}>
          {/* Player 1 */}
          <View style={[styles.playerColumn, isLandscape && styles.playerColumnLandscape]}>
            <Text style={[styles.playerLabel, darkTheme ? styles.labelLight : styles.labelDark, { fontSize: responsive.playerLabelFontSize }]}>{player1Name}</Text>
            <View style={[styles.scoreDisplay, { width: responsive.scoreDisplaySize, height: responsive.scoreDisplaySize }]}>
              <Text style={[styles.scoreText, { fontSize: responsive.scoreFontSize }]}>{player1Score}</Text>
            </View>
            <View style={[styles.buttonRowHorizontal, isLandscape && styles.buttonRowVertical]}>
              <TouchableOpacity 
                style={[styles.scoreButton, styles.plusButton, { width: responsive.buttonSize, height: responsive.buttonSize }]}
                onPress={() => addScore(1, step)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={responsive.buttonIconSize} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.scoreButton, styles.minusButton, { width: responsive.buttonSize, height: responsive.buttonSize }]}
                onPress={() => addScore(1, -step)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="remove" size={responsive.buttonIconSize} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, isLandscape && styles.dividerLandscape]} />

          {/* Player 2 */}
          <View style={[styles.playerColumn, isLandscape && styles.playerColumnLandscape]}>
            <Text style={[styles.playerLabel, darkTheme ? styles.labelLight : styles.labelDark, { fontSize: responsive.playerLabelFontSize }]}>{player2Name}</Text>
            <View style={[styles.scoreDisplay, { width: responsive.scoreDisplaySize, height: responsive.scoreDisplaySize }]}>
              <Text style={[styles.scoreText, { fontSize: responsive.scoreFontSize }]}>{player2Score}</Text>
            </View>
            <View style={[styles.buttonRowHorizontal, isLandscape && styles.buttonRowVertical]}>
              <TouchableOpacity 
                style={[styles.scoreButton, styles.plusButton, { width: responsive.buttonSize, height: responsive.buttonSize }]}
                onPress={() => addScore(2, step)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={responsive.buttonIconSize} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.scoreButton, styles.minusButton, { width: responsive.buttonSize, height: responsive.buttonSize }]}
                onPress={() => addScore(2, -step)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="remove" size={responsive.buttonIconSize} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.footerRow, isLandscape && styles.footerRowLandscape]}>
          <TouchableOpacity 
            style={[styles.resetButton, isSmallScreen && styles.resetButtonSmall]}
            onPress={resetScores}
            activeOpacity={0.8}
          >
            <MaterialIcons name="refresh" size={isSmallScreen ? 16 : 20} color="#fff" style={styles.resetIcon} />
            <Text style={[styles.resetButtonText, isSmallScreen && { fontSize: 14 }]}>Reset</Text>
          </TouchableOpacity>

          <View style={styles.stepDisplay}>
            <Text style={[styles.stepText, darkTheme ? styles.stepTextLight : styles.stepTextDark]}>Step</Text>
            <Text style={[styles.stepValue, darkTheme ? styles.stepTextLight : styles.stepTextDark]}>{step}</Text>
          </View>
        </View>

        {/* Settings Modal */}
        <Modal visible={settingsVisible} animationType="slide" onRequestClose={() => setSettingsVisible(false)}>
          <View style={[styles.modalContainer, darkTheme ? styles.darkBg : styles.lightBg, { padding: responsive.modalPadding, paddingTop: isSmallScreen ? 40 : 60 }]}>
            <Text style={[styles.modalTitle, darkTheme ? styles.headerTitleLight : styles.headerTitleDark, { fontSize: responsive.modalTitleFontSize }]}>Settings</Text>
            <Text style={[styles.modalLabel, darkTheme ? styles.labelLight : styles.labelDark]}>Player 1 Name</Text>
            <TextInput style={[styles.input, darkTheme ? styles.inputDark : styles.inputLight]} value={player1Name} onChangeText={setPlayer1Name} />
            <Text style={[styles.modalLabel, darkTheme ? styles.labelLight : styles.labelDark]}>Player 2 Name</Text>
            <TextInput style={[styles.input, darkTheme ? styles.inputDark : styles.inputLight]} value={player2Name} onChangeText={setPlayer2Name} />

            <Text style={[styles.modalLabel, darkTheme ? styles.labelLight : styles.labelDark]}>Increment Step</Text>
            <View style={styles.stepControls}>
              <TouchableOpacity onPress={() => setStep((s) => Math.max(1, s-1))} style={styles.smallBtn}><MaterialIcons name="remove" size={isSmallScreen ? 16 : 20} color={darkTheme ? '#fff' : '#333'} /></TouchableOpacity>
              <Text style={[styles.stepValueBig, darkTheme ? styles.stepTextLight : styles.stepTextDark]}>{step}</Text>
              <TouchableOpacity onPress={() => setStep((s) => s+1)} style={styles.smallBtn}><MaterialIcons name="add" size={isSmallScreen ? 16 : 20} color={darkTheme ? '#fff' : '#333'} /></TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.modalLabel, darkTheme ? styles.labelLight : styles.labelDark]}>Dark Theme</Text>
              <Switch value={darkTheme} onValueChange={setDarkTheme} />
            </View>

            <View style={[styles.modalActions, isSmallScreen && styles.modalActionsSmall]}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSettingsVisible(false)}><Text style={styles.closeBtnText}>Done</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* History Modal */}
        <Modal visible={historyVisible} animationType="slide" onRequestClose={() => setHistoryVisible(false)}>
          <View style={[styles.modalContainer, darkTheme ? styles.darkBg : styles.lightBg, { padding: responsive.modalPadding, paddingTop: isSmallScreen ? 40 : 60 }]}>
            <Text style={[styles.modalTitle, darkTheme ? styles.headerTitleLight : styles.headerTitleDark, { fontSize: responsive.modalTitleFontSize }]}>Action History</Text>
            <FlatList data={actionHistory} keyExtractor={(it) => String(it.time)} renderItem={({item}) => (
              <View style={styles.historyItem}>
                <Text style={[styles.historyText, darkTheme ? styles.labelLight : styles.labelDark]}>{item.note ? item.note : `${item.amount > 0 ? '+' : ''}${item.amount} ${item.player===1?player1Name: item.player===2?player2Name:'(system)'}`}</Text>
                <Text style={[styles.historyTime, darkTheme ? styles.labelLight : styles.labelDark]}>{new Date(item.time).toLocaleString()}</Text>
              </View>
            )} ListEmptyComponent={() => <Text style={[styles.noHistory, darkTheme ? styles.labelLight : styles.labelDark]}>No history yet</Text>} />

            <View style={[styles.modalActions, isSmallScreen && styles.modalActionsSmall]}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}><Text style={styles.clearBtnText}>Clear</Text></TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setHistoryVisible(false)}><Text style={styles.closeBtnText}>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerTitleDark: { color: '#333' },
  headerTitleLight: { color: '#fff' },
  darkBg: { backgroundColor: '#14202b' },
  lightBg: { backgroundColor: '#f6f9fc' },
  scoreboardContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  scoreboardContainerLandscape: { paddingHorizontal: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16 },
  headerRowLandscape: { paddingTop: 20, paddingHorizontal: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8, marginLeft: 6 },
  playerColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerColumnLandscape: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  playerLabel: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  labelLight: { color: '#fff' },
  labelDark: { color: '#333' },
  scoreDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scoreText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonRowHorizontal: { flexDirection: 'row', gap: 16 },
  buttonRowVertical: { flexDirection: 'column', gap: 12 },
  scoreButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  plusButton: {
    backgroundColor: '#27ae60',
  },
  minusButton: {
    backgroundColor: '#e74c3c',
  },
  divider: {
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 15,
  },
  dividerLandscape: { height: 2, width: '80%', marginVertical: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  footerRowLandscape: { paddingHorizontal: 16, paddingBottom: 20 },
  resetButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonSmall: { paddingHorizontal: 12, paddingVertical: 8 },
  resetIcon: {
    marginRight: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepDisplay: { alignItems: 'center' },
  stepText: { fontSize: 12 },
  stepTextLight: { color: '#fff' },
  stepTextDark: { color: '#333' },
  stepValue: { fontSize: 16, fontWeight: '700', color: '#fff' },
  stepValueBig: { fontSize: 24, fontWeight: '700' },
  
  /* Modal styles */
  modalContainer: { flex: 1, padding: 20, paddingTop: 60 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  modalLabel: { fontSize: 14, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, marginTop: 8 },
  inputDark: { borderColor: 'rgba(255,255,255,0.2)', color: '#fff' },
  inputLight: { borderColor: '#ddd', color: '#333' },
  stepControls: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  smallBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  modalActionsSmall: { gap: 8 },
  closeBtn: { backgroundColor: '#2d9cdb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  closeBtnText: { color: '#fff', fontWeight: '700' },
  clearBtn: { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  clearBtnText: { color: '#fff', fontWeight: '700' },
  historyItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyText: { fontSize: 14 },
  historyTime: { fontSize: 11, color: '#888' },
  noHistory: { padding: 20, textAlign: 'center' },
});
