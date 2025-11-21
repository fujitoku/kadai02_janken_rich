// ========================================
// ゲーム設定
// ========================================

// 手の種類（グー・パー・チョキ）
const HANDS = ["rock", "paper", "scissors"];

// 絵文字マッピング
const EMOJIS = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️"
};

// ========================================
// ゲーム状態管理
// ========================================

// ゲームの状態（STOPPED/SPINNING/JUDGING）
let gameState = "STOPPED";

// プレイヤーの結果
let playerResults = ["", "", ""];

// コンピューターの結果
let computerResults = ["", "", ""];

// スロット回転タイマー
let spinTimers = [null, null, null];
let computerSpinTimers = [null, null, null];

// 停止したスロット数
let stoppedCount = 0;

// ========================================
// ページ読み込み時の初期化
// ========================================

window.onload = function() {
  console.log("ゲーム準備完了");
  
  // 初期表示をランダムに設定
  for (let i = 0; i < 3; i++) {
    const randomHand = HANDS[Math.floor(Math.random() * HANDS.length)];
    document.getElementById("surotto" + (i + 1)).querySelector(".emoji").textContent = EMOJIS[randomHand];
  }
};

// ========================================
// STARTボタンクリック処理
// ========================================

function sutaatoBotannWoOsu() {
  // 連打防止チェック
  if (gameState !== "STOPPED") {
    showError("すでに、いま回ってる！");
    return;
  }
  
  // ゲーム状態を回転中に変更
  gameState = "SPINNING";
  
  // スタート音を再生
  playSound("start");
  
  // 画面をリセット
  document.getElementById("kekkaHyouji").textContent = "";
  document.getElementById("kekkaHyouji").classList.remove("hyouji-chuu");
  document.getElementById("aiteGoukei").innerHTML = '合計: <span class="tensu-kazu">?</span>点';
  document.getElementById("jibunGoukei").innerHTML = '合計: <span class="tensu-kazu">0</span>点';
  
  // 結果をリセット
  playerResults = ["", "", ""];
  computerResults = ["", "", ""];
  stoppedCount = 0;
  
  // 停止順をランダムに決定
  const stopPattern = getRandomStopPattern();
  
  // 3つのスロット回転を開始
  for (let i = 0; i < 3; i++) {
    spinSlot(i + 1, "surotto", spinTimers);
    spinSlot(i + 1, "aiteSurotto", computerSpinTimers);
  }
  
  // スロット停止を予約
  stopPattern.forEach(item => {
    setTimeout(() => {
      stopSlot(item.slot, "surotto", spinTimers, playerResults);
      stopSlot(item.slot, "aiteSurotto", computerSpinTimers, computerResults);
    }, item.time);
  });
}

// ========================================
// ランダムな停止パターンを取得
// ========================================

function getRandomStopPattern() {
  // 4つの停止パターン
  const patterns = [
    // パターン1: 左 → 中 → 右
    [{ slot: 1, time: 2000 }, { slot: 2, time: 2600 }, { slot: 3, time: 3200 }],
    // パターン2: 右 → 中 → 左
    [{ slot: 3, time: 2000 }, { slot: 2, time: 2600 }, { slot: 1, time: 3200 }],
    // パターン3: 中 → 左 → 右
    [{ slot: 2, time: 2000 }, { slot: 1, time: 2600 }, { slot: 3, time: 3200 }],
    // パターン4: 中 → 右 → 左
    [{ slot: 2, time: 2000 }, { slot: 3, time: 2600 }, { slot: 1, time: 3200 }]
  ];
  
  // ランダムに1つ選択
  return patterns[Math.floor(Math.random() * patterns.length)];
}

// ========================================
// スロット回転処理
// ========================================

function spinSlot(slotNum, prefix, timers) {
  console.log(prefix + slotNum + "の回転を開始");
  
  // スロット要素を取得
  const slot = document.getElementById(prefix + slotNum);
  const emoji = slot.querySelector(".emoji");
  
  // 回転中のアニメーションを追加
  slot.classList.add("kaiten-chuu");
  
  // 50msごとにランダムな絵文字を表示
  timers[slotNum - 1] = setInterval(() => {
    const randomHand = HANDS[Math.floor(Math.random() * HANDS.length)];
    emoji.textContent = EMOJIS[randomHand];
  }, 50);
}

// ========================================
// スロット停止処理
// ========================================

function stopSlot(slotNum, prefix, timers, results) {
  console.log(prefix + slotNum + "を停止");
  
  const index = slotNum - 1;
  
  // 回転タイマーを停止
  clearInterval(timers[index]);
  timers[index] = null;
  
  // スロット要素を取得
  const slot = document.getElementById(prefix + slotNum);
  const emoji = slot.querySelector(".emoji");
  
  // 回転中のアニメーションを削除
  slot.classList.remove("kaiten-chuu");
  
  // ランダムに手を決定
  const hand = HANDS[Math.floor(Math.random() * HANDS.length)];
  results[index] = hand;
  emoji.textContent = EMOJIS[hand];
  
  // 停止音を再生
  playSound("stop");
  
  // プレイヤーのスロットの場合のみカウント
  if (prefix === "surotto") {
    stoppedCount++;
    
    // 3つ全て停止したら判定
    if (stoppedCount === 3) {
      setTimeout(judgeResult, 500);
    }
  }
}

// ========================================
// 結果判定処理
// ========================================

function judgeResult() {
  console.log("判定を開始");
  console.log("プレイヤー:", playerResults);
  console.log("コンピューター:", computerResults);
  
  // ゲーム状態を判定中に変更
  gameState = "JUDGING";
  
  // スコアを計算
  const playerScore = calculateScore(playerResults);
  const computerScore = calculateScore(computerResults);
  
  console.log("プレイヤー: " + playerScore.description + " = " + playerScore.points + "点");
  console.log("コンピューター: " + computerScore.description + " = " + computerScore.points + "点");
  
  // スコアを画面に表示
  document.getElementById("jibunGoukei").innerHTML = 
    `合計: <span class="tensu-kazu">${playerScore.points}</span>点（${playerScore.description}）`;
  document.getElementById("aiteGoukei").innerHTML = 
    `合計: <span class="tensu-kazu">${computerScore.points}</span>点（${computerScore.description}）`;
  
  // 勝敗を判定
  let result;
  if (playerScore.points > computerScore.points) {
    result = "勝ち";
    console.log("勝った！");
    playSound("win");
  } else if (playerScore.points < computerScore.points) {
    result = "負け";
    console.log("負けた...");
    playSound("lose");
  } else {
    result = "あいこ";
    console.log("あいこ！");
    playSound("draw");
  }
  
  // 結果を画面に表示
  const resultElement = document.getElementById("kekkaHyouji");
  resultElement.textContent = `あなた: ${playerScore.points}点 vs コンピューター: ${computerScore.points}点 → ${result}！`;
  resultElement.classList.add("hyouji-chuu");
  
  // ゲーム状態を停止中に戻す
  setTimeout(() => {
    gameState = "STOPPED";
    console.log("もう一度STARTボタンを押せます");
  }, 1000);
}

// ========================================
// スコア計算処理
// ========================================

function calculateScore(results) {
  // 各手の出現回数をカウント
  const counts = { rock: 0, paper: 0, scissors: 0 };
  results.forEach(hand => counts[hand]++);
  
  // 最大出現回数を取得
  const maxCount = Math.max(...Object.values(counts));
  
  // 揃い方で点数を決定
  if (maxCount === 3) {
    // 3つ揃い → 3点
    return { points: 3, description: "3つ揃い" };
  } else if (maxCount === 2) {
    // 2つ揃い → 2点
    return { points: 2, description: "2つ揃い" };
  } else {
    // バラバラ → 1点
    return { points: 1, description: "バラバラ" };
  }
}

// ========================================
// 音声再生処理（Web Audio API）
// ========================================

function playSound(type) {
  try {
    // AudioContextを作成
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 音声パターン定義
    const sounds = {
      // 停止音（ピッ）
      stop: [
        { freq: 800, time: 0, duration: 0.1, type: "sine", volume: 0.3 }
      ],
      // スタート音（ピピッ！）
      start: [
        { freq: 880, time: 0, duration: 0.08, type: "square", volume: 0.2 },
        { freq: 1047, time: 0.1, duration: 0.08, type: "square", volume: 0.2 }
      ],
      // 勝利音（ピロリン♪）
      win: [
        { freq: 523, time: 0, duration: 0.15, type: "sine", volume: 0.3, fade: true },
        { freq: 659, time: 0.15, duration: 0.15, type: "sine", volume: 0.3, fade: true },
        { freq: 784, time: 0.3, duration: 0.15, type: "sine", volume: 0.3, fade: true }
      ],
      // 負け音（ピロロン...）
      lose: [
        { freq: 659, time: 0, duration: 0.2, type: "sine", volume: 0.25, fade: true },
        { freq: 523, time: 0.15, duration: 0.2, type: "sine", volume: 0.25, fade: true },
        { freq: 392, time: 0.3, duration: 0.2, type: "sine", volume: 0.25, fade: true }
      ],
      // あいこ音（ポーン）
      draw: [
        { freq: 523, time: 0, duration: 0.4, type: "triangle", volume: 0.2, fade: true },
        { freq: 659, time: 0, duration: 0.4, type: "triangle", volume: 0.2, fade: true }
      ]
    };
    
    // 指定された音声を再生
    sounds[type].forEach(sound => {
      // オシレーター（音源）を作成
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // 音の種類と周波数を設定
      oscillator.type = sound.type;
      oscillator.frequency.value = sound.freq;
      
      // 音量を設定（フェードアウトあり/なし）
      if (sound.fade) {
        gainNode.gain.setValueAtTime(sound.volume, audioContext.currentTime + sound.time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.time + sound.duration);
      } else {
        gainNode.gain.value = sound.volume;
      }
      
      // 接続: オシレーター → ゲイン → スピーカー
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 音を開始・停止
      oscillator.start(audioContext.currentTime + sound.time);
      oscillator.stop(audioContext.currentTime + sound.time + sound.duration);
    });
  } catch (error) {
    console.log("音声再生エラー:", error);
  }
}

// ========================================
// エラーメッセージ表示処理
// ========================================

function showError(message) {
  console.log("エラー:", message);
  
  // エラーメッセージ要素を取得
  const errorElement = document.getElementById("eraaMesseeji");
  
  // メッセージを設定
  errorElement.textContent = message;
  
  // 表示クラスを追加
  errorElement.classList.add("hyouji-chuu");
  
  // 2秒後に自動で消える
  setTimeout(() => {
    errorElement.classList.remove("hyouji-chuu");
    // フェードアウト後にテキストをクリア
    setTimeout(() => {
      errorElement.textContent = "";
    }, 300);
  }, 2000);
}
