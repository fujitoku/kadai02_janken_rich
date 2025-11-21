# じゃんけんスロットゲーム - コード分析ドキュメント

## 目次
1. [プロジェクト全体像（トップダウン分析）](#1-プロジェクト全体像トップダウン分析)
2. [ファイル構成と役割](#2-ファイル構成と役割)
3. [依存関係とデータフロー](#3-依存関係とデータフロー)
4. [静的解析：コード構造の詳細](#4-静的解析コード構造の詳細)
5. [動的解析：実行フローの追跡](#5-動的解析実行フローの追跡)
6. [設計意図と実装パターン](#6-設計意図と実装パターン)
7. [改善履歴と最適化](#7-改善履歴と最適化)

---

## 1. プロジェクト全体像（トップダウン分析）

### 1.1 アプリケーションの概要

**アプリ名**: じゃんけんスロットゲーム

**目的**: スロットマシンとじゃんけんを組み合わせた対戦型ゲーム

**主要機能**:
- プレイヤーとコンピューターが3つのスロットを回転
- 揃った手の数で点数を計算（3つ揃い=3点、2つ揃い=2点、バラバラ=1点）
- 点数で勝敗を判定
- 効果音による演出（5種類の音声）

**技術スタック**:
- HTML5（構造）
- CSS3（スタイリング・アニメーション）
- Vanilla JavaScript（ロジック）
- Web Audio API（音声生成）

---

## 2. ファイル構成と役割

### 2.1 ファイル一覧

```
kadai02_janken_rich/
├── index.html          # HTMLドキュメント（構造定義）
├── style.css           # スタイルシート（見た目・アニメーション）
├── JS/
│   └── test.js        # JavaScriptロジック（ゲーム制御）
└── README.md          # プロジェクト説明
```

### 2.2 各ファイルの役割詳細

#### **index.html**（111行）
**役割**: アプリケーションの構造定義

**主要な責務**:
- DOM要素の配置（スロット、ボタン、表示エリア）
- 外部リソースの読み込み（CSS、JavaScript）
- イベントハンドラの設定（onclick属性）

**重要なDOM要素**:
| 要素ID | 役割 | 備考 |
|--------|------|------|
| `aiteSurotto1-3` | コンピューターのスロット | 3つ |
| `surotto1-3` | プレイヤーのスロット | 3つ |
| `aiteGoukei` | コンピューターの点数表示 | 動的更新 |
| `jibunGoukei` | プレイヤーの点数表示 | 動的更新 |
| `kekkaHyouji` | 勝敗結果表示 | 動的更新 |
| `sutaatoBotann` | STARTボタン | クリックイベント |
| `eraaMesseeji` | エラーメッセージ表示 | 動的更新 |

**入力**: ユーザーのボタンクリック  
**出力**: 視覚的なUI表示

---

#### **style.css**（195行）
**役割**: 視覚的なデザインとアニメーション定義

**主要な責務**:
- レイアウト設計（Flexbox使用）
- カラースキーム（黄色系の温かみのある配色）
- アニメーション効果（回転、結果表示）

**重要なスタイルクラス**:
| クラス名 | 役割 | 特徴 |
|---------|------|------|
| `.geemu-zentai` | ゲーム全体のコンテナ | 中央配置、最大幅1000px |
| `.surotto-waku` | スロット枠 | 200×200px、円形 |
| `.kaiten-chuu` | 回転中のアニメーション | 震えるエフェクト |
| `.hyouji-chuu` | 表示中の状態 | フェードイン効果 |
| `@keyframes furueru` | 回転アニメーション | ±1度の回転 |
| `@keyframes kekkaHyouji` | 結果表示アニメーション | 拡大・回転 |

**入力**: HTML要素とクラス名  
**出力**: 視覚的なスタイルとアニメーション

---

#### **JS/test.js**（349行）
**役割**: ゲームロジックの中核

**主要な責務**:
- ゲーム状態管理
- スロット制御（回転・停止）
- スコア計算
- 勝敗判定
- 音声再生
- エラーハンドリング

**入力**: ユーザーのボタンクリック、タイマーイベント  
**出力**: DOM操作、音声再生、コンソールログ

---

## 3. 依存関係とデータフロー

### 3.1 ファイル間の依存関係図

```
┌─────────────────┐
│   index.html    │ ← エントリーポイント
└────────┬────────┘
         │
         ├─── 読み込み ──→ ┌──────────────┐
         │                  │  style.css   │
         │                  └──────────────┘
         │
         └─── 読み込み ──→ ┌──────────────┐
                            │ JS/test.js   │
                            └──────────────┘
```

**依存の方向性**:
- HTML → CSS（一方向、スタイル適用）
- HTML → JavaScript（一方向、DOM操作）
- JavaScript → HTML（双方向、DOM読み取り・更新）

### 3.2 データフローダイアグラム

```
[ユーザー] 
    ↓ クリック
[STARTボタン]
    ↓
[sutaatoBotannWoOsu()] ← エントリーポイント
    ↓
    ├─→ [gameState = "SPINNING"] ← 状態変更
    ├─→ [playSound("start")] ← 音声再生
    ├─→ [画面リセット] ← DOM操作
    ├─→ [getRandomStopPattern()] ← パターン取得
    └─→ [spinSlot() × 6] ← スロット回転開始
            ↓
        [setInterval] ← 50msごとに絵文字変更
            ↓
        [setTimeout] ← 指定時間後に停止
            ↓
        [stopSlot() × 6] ← スロット停止
            ↓
        [stoppedCount === 3] ← 停止カウント
            ↓
        [judgeResult()] ← 判定処理
            ↓
            ├─→ [calculateScore()] ← スコア計算
            ├─→ [勝敗判定]
            ├─→ [playSound()] ← 結果音再生
            └─→ [画面更新] ← 結果表示
                    ↓
                [gameState = "STOPPED"] ← 状態リセット
```

### 3.3 状態遷移図

```
┌──────────┐
│ STOPPED  │ ← 初期状態・待機中
└─────┬────┘
      │ STARTボタンクリック
      ↓
┌──────────┐
│ SPINNING │ ← スロット回転中
└─────┬────┘
      │ 全スロット停止
      ↓
┌──────────┐
│ JUDGING  │ ← 判定処理中
└─────┬────┘
      │ 判定完了（1秒後）
      ↓
┌──────────┐
│ STOPPED  │ ← 再びプレイ可能
└──────────┘
```

---

## 4. 静的解析：コード構造の詳細

### 4.1 グローバル変数とデータ構造

#### **定数（const）**

```javascript
// 手の種類を定義
const HANDS = ["rock", "paper", "scissors"];

// 絵文字マッピング
const EMOJIS = {
  rock: "✊",      // グー
  paper: "✋",     // パー
  scissors: "✌️"  // チョキ
};
```

**設計意図**:
- `HANDS`配列: ランダム選択とループ処理を容易にする
- `EMOJIS`オブジェクト: 手の種類から絵文字への変換を高速化（O(1)）

#### **状態管理変数（let）**

```javascript
let gameState = "STOPPED";           // ゲーム状態
let playerResults = ["", "", ""];    // プレイヤーの結果
let computerResults = ["", "", ""];  // コンピューターの結果
let spinTimers = [null, null, null]; // プレイヤーのタイマー
let computerSpinTimers = [null, null, null]; // コンピューターのタイマー
let stoppedCount = 0;                // 停止カウント
```

**設計意図**:
- 配列を使用することで3つのスロットを統一的に管理
- タイマーを配列で管理し、個別に停止可能
- `stoppedCount`で全停止を検知

### 4.2 関数一覧と責務

#### **初期化関数**

```javascript
window.onload = function() { ... }
```
- **責務**: ページ読み込み時の初期化
- **処理**: 各スロットにランダムな手を表示
- **呼び出し**: ブラウザによる自動実行

---

#### **メイン制御関数**

```javascript
function sutaatoBotannWoOsu() { ... }
```
- **責務**: ゲーム開始のエントリーポイント
- **処理**: 
  1. 連打防止チェック
  2. 状態変更（STOPPED → SPINNING）
  3. 音声再生
  4. 画面リセット
  5. スロット回転開始
  6. 停止予約
- **入力**: なし（ボタンクリックから呼び出し）
- **出力**: なし（副作用として状態変更・DOM操作）

---

#### **パターン生成関数**

```javascript
function getRandomStopPattern() { ... }
```
- **責務**: ランダムな停止順を決定
- **処理**: 4パターンからランダムに1つ選択
- **入力**: なし
- **出力**: `[{slot: number, time: number}, ...]`形式の配列
- **パターン**:
  - パターン1: 左→中→右（2000ms, 2600ms, 3200ms）
  - パターン2: 右→中→左
  - パターン3: 中→左→右
  - パターン4: 中→右→左

**設計意図**: 毎回異なる演出で飽きさせない

---

#### **スロット制御関数**

```javascript
function spinSlot(slotNum, prefix, timers) { ... }
```
- **責務**: スロット回転の開始
- **パラメータ**:
  - `slotNum`: スロット番号（1-3）
  - `prefix`: ID接頭辞（"surotto" or "aiteSurotto"）
  - `timers`: タイマー配列への参照
- **処理**:
  1. DOM要素取得
  2. アニメーションクラス追加
  3. setIntervalで50msごとに絵文字変更
  4. タイマーIDを配列に保存

**設計意図**: 汎用関数として設計し、プレイヤー・コンピューター両方で使用

---

```javascript
function stopSlot(slotNum, prefix, timers, results) { ... }
```
- **責務**: スロット停止処理
- **パラメータ**:
  - `slotNum`: スロット番号（1-3）
  - `prefix`: ID接頭辞
  - `timers`: タイマー配列
  - `results`: 結果配列への参照
- **処理**:
  1. タイマー停止（clearInterval）
  2. アニメーションクラス削除
  3. ランダムに手を決定
  4. 結果配列に格納
  5. 停止音再生
  6. プレイヤーの場合、停止カウント増加
  7. 全停止時、判定処理を予約

**設計意図**: 
- 汎用関数として両者で共用
- プレイヤーのみカウントすることで判定タイミングを制御

---

#### **判定・計算関数**

```javascript
function judgeResult() { ... }
```
- **責務**: 勝敗判定と結果表示
- **処理**:
  1. 状態変更（SPINNING → JUDGING）
  2. 両者のスコア計算
  3. 勝敗判定
  4. 結果音再生
  5. 画面更新
  6. 状態リセット（JUDGING → STOPPED）
- **依存**: `calculateScore()`関数

---

```javascript
function calculateScore(results) { ... }
```
- **責務**: 揃い方から点数を計算
- **入力**: `["rock", "paper", "scissors"]`形式の配列
- **出力**: `{points: number, description: string}`形式のオブジェクト
- **アルゴリズム**:
  1. 各手の出現回数をカウント
  2. 最大出現回数を取得
  3. 最大値に応じて点数決定
     - 3回 → 3点（3つ揃い）
     - 2回 → 2点（2つ揃い）
     - 1回 → 1点（バラバラ）

**計算量**: O(n) = O(3) = O(1)（配列長が固定のため実質定数時間）

---

#### **音声再生関数**

```javascript
function playSound(type) { ... }
```
- **責務**: Web Audio APIを使った効果音再生
- **入力**: 音声タイプ（"stop", "start", "win", "lose", "draw"）
- **処理**:
  1. AudioContext作成
  2. 音声パターン定義から該当データ取得
  3. 各音に対してオシレーター作成
  4. 周波数・音量・波形を設定
  5. フェードアウト処理（必要な場合）
  6. 再生開始・停止

**音声パターン詳細**:

| タイプ | 音数 | 周波数（Hz） | 波形 | 説明 |
|--------|------|-------------|------|------|
| stop | 1 | 800 | sine | 短い「ピッ」 |
| start | 2 | 880, 1047 | square | 「ピピッ！」 |
| win | 3 | 523, 659, 784 | sine | 上昇音「ピロリン♪」 |
| lose | 3 | 659, 523, 392 | sine | 下降音「ピロロン...」 |
| draw | 2 | 523, 659 | triangle | 和音「ポーン」 |

**設計意図**: 
- 1つの関数で全音声を管理（DRY原則）
- データ駆動設計で拡張性を確保
- 外部ファイル不要で軽量

---

#### **エラー表示関数**

```javascript
function showError(message) { ... }
```
- **責務**: エラーメッセージの表示と自動非表示
- **処理**:
  1. メッセージをDOM要素に設定
  2. 表示クラス追加
  3. 2秒後に自動で非表示
  4. フェードアウト後にテキストクリア

**設計意図**: ユーザー体験を損なわない一時的な通知

---

### 4.3 クラス・モジュール構造

このプロジェクトはクラスベースではなく、**関数型プログラミング**と**手続き型プログラミング**のハイブリッドアプローチを採用しています。

**構造的特徴**:
- グローバル状態を関数で操作
- 純粋関数（`calculateScore`, `getRandomStopPattern`）と副作用のある関数（`spinSlot`, `stopSlot`）を明確に分離
- イベント駆動型アーキテクチャ

**将来的なリファクタリング案**:
```javascript
class SlotGame {
  constructor() {
    this.gameState = "STOPPED";
    this.playerSlots = new SlotMachine("surotto");
    this.computerSlots = new SlotMachine("aiteSurotto");
  }
  
  start() { ... }
  judge() { ... }
}

class SlotMachine {
  constructor(prefix) {
    this.prefix = prefix;
    this.results = ["", "", ""];
    this.timers = [null, null, null];
  }
  
  spin() { ... }
  stop() { ... }
}
```

---

## 5. 動的解析：実行フローの追跡

### 5.1 実行シーケンス（時系列）

#### **フェーズ1: ページ読み込み（0ms）**

```
[ブラウザ] 
  → HTML解析
  → CSS読み込み・適用
  → JavaScript読み込み
  → window.onload実行
      → 各スロットにランダム絵文字表示
      → console.log("ゲーム準備完了")
```

#### **フェーズ2: ゲーム開始（ユーザークリック時）**

```
[0ms] ユーザーがSTARTボタンクリック
  → sutaatoBotannWoOsu()実行
      → gameState確認（STOPPED?）
      → gameState = "SPINNING"
      → playSound("start") ← 音声再生
      → DOM要素リセット
      → getRandomStopPattern() ← パターン取得
      → for文で6回spinSlot()呼び出し
          → 各スロットでsetInterval開始（50ms間隔）
      → stopPattern.forEach()でsetTimeout予約
```

#### **フェーズ3: スロット回転（0ms〜3200ms）**

```
[0ms〜2000ms] 全スロット高速回転
  → 50msごとに絵文字変更
  → .kaiten-chuuクラスで震えるアニメーション

[2000ms] 最初のスロット停止
  → stopSlot()実行
  → clearInterval()
  → ランダムに手を決定
  → playSound("stop")
  → stoppedCount++（プレイヤーのみ）

[2600ms] 2番目のスロット停止
  → 同様の処理
  → stoppedCount++

[3200ms] 3番目のスロット停止
  → 同様の処理
  → stoppedCount++ → stoppedCount === 3
  → setTimeout(judgeResult, 500)予約
```

#### **フェーズ4: 判定（3700ms）**

```
[3700ms] judgeResult()実行
  → gameState = "JUDGING"
  → calculateScore(playerResults)
      → 各手をカウント
      → 最大出現回数から点数決定
  → calculateScore(computerResults)
  → 勝敗判定
      → if (player > computer) → "勝ち" + playSound("win")
      → else if (player < computer) → "負け" + playSound("lose")
      → else → "あいこ" + playSound("draw")
  → DOM更新（点数・結果表示）
  → setTimeout(() => gameState = "STOPPED", 1000)

[4700ms] ゲーム状態リセット
  → gameState = "STOPPED"
  → 再びSTARTボタンが押せる状態に
```

### 5.2 メモリ使用状況

**グローバル変数のメモリ使用量**:
```
HANDS: 配列（3要素） ≈ 100 bytes
EMOJIS: オブジェクト（3プロパティ） ≈ 150 bytes
gameState: 文字列 ≈ 20 bytes
playerResults: 配列（3要素） ≈ 100 bytes
computerResults: 配列（3要素） ≈ 100 bytes
spinTimers: 配列（3要素） ≈ 50 bytes
computerSpinTimers: 配列（3要素） ≈ 50 bytes
stoppedCount: 数値 ≈ 8 bytes

合計: 約 600 bytes（非常に軽量）
```

**タイマーの管理**:
- 最大6個のsetInterval（回転中）
- 最大3個のsetTimeout（停止予約）
- 最大2個のsetTimeout（判定・状態リセット）

**メモリリーク対策**:
- 全てのsetIntervalをclearIntervalで確実に停止
- タイマーIDを配列で管理し、nullで初期化

### 5.3 パフォーマンス分析

**DOM操作の頻度**:
- スロット回転中: 50msごと × 6スロット = 120回/秒
- 合計約3.2秒間 = 約384回のDOM操作

**最適化ポイント**:
- `querySelector()`の結果をキャッシュすることで高速化可能
- `textContent`の使用（`innerHTML`より高速）
- CSSアニメーションの活用（JavaScriptより効率的）

**改善案**:
```javascript
// 現在
const emoji = slot.querySelector(".emoji");

// 改善案（初期化時にキャッシュ）
const emojiElements = {
  surotto1: document.querySelector("#surotto1 .emoji"),
  surotto2: document.querySelector("#surotto2 .emoji"),
  // ...
};
```

---

## 6. 設計意図と実装パターン

### 6.1 採用された設計パターン

#### **1. データ駆動設計（Data-Driven Design）**

**適用箇所**: 音声再生システム

```javascript
const sounds = {
  stop: [{ freq: 800, time: 0, duration: 0.1, type: "sine", volume: 0.3 }],
  start: [/* ... */],
  // ...
};
```

**メリット**:
- 音声の追加・変更が容易
- ロジックとデータの分離
- テストしやすい

---

#### **2. 状態機械パターン（State Machine Pattern）**

**適用箇所**: ゲーム状態管理

```javascript
let gameState = "STOPPED"; // STOPPED → SPINNING → JUDGING → STOPPED
```

**メリット**:
- 不正な状態遷移を防止
- デバッグが容易
- 連打防止を実現

---

#### **3. タイマーパターン（Timer Pattern）**

**適用箇所**: スロット制御

```javascript
// 回転開始
timers[index] = setInterval(/* ... */, 50);

// 停止
clearInterval(timers[index]);
timers[index] = null;
```

**メリット**:
- 非同期処理の管理
- 個別停止が可能
- メモリリーク防止

---

#### **4. 関数の汎用化パターン**

**適用箇所**: スロット制御関数

```javascript
function spinSlot(slotNum, prefix, timers) {
  // prefixで"surotto"と"aiteSurotto"を切り替え
}
```

**メリット**:
- コードの重複削減
- 保守性の向上
- バグ修正が一箇所で済む

---

### 6.2 設計上の重要な判断

#### **判断1: なぜクラスではなく関数型アプローチか？**

**理由**:
- シンプルなゲームロジック
- 状態が少ない（6つのグローバル変数）
- 初心者にも理解しやすい
- オーバーエンジニアリングを避ける

**トレードオフ**:
- 拡張性はやや低い
- グローバル変数の管理が必要
- 大規模化には向かない

---

#### **判断2: なぜWeb Audio APIを使用したか？**

**理由**:
- 外部ファイル不要（軽量化）
- プログラマティックに音を生成
- ブラウザ標準API（互換性）
- 音のカスタマイズが自由

**トレードオフ**:
- 複雑な音は作れない
- 音質は限定的
- ブラウザによる挙動の違い

---

#### **判断3: なぜ停止順をランダムにしたか？**

**理由**:
- リプレイ性の向上
- 演出のバリエーション
- 予測不可能性による面白さ

**実装**:
- 4パターンを事前定義
- `Math.random()`で選択
- 時間差を600msに設定（視覚的に認識しやすい）

---

### 6.3 コーディング規約と命名規則

#### **変数命名**

| 種類 | 規則 | 例 |
|------|------|-----|
| 定数 | UPPER_SNAKE_CASE | `HANDS`, `EMOJIS` |
| グローバル変数 | camelCase | `gameState`, `playerResults` |
| ローカル変数 | camelCase | `randomHand`, `index` |
| 関数 | camelCase | `spinSlot`, `calculateScore` |

**日本語と英語の混在**:
- HTML/CSS: 日本語のローマ字表記（`sutaato-botann`）
- JavaScript: 英語（`gameState`, `playerResults`）

**理由**: リファクタリング時に英語化し、可読性を向上

---

## 7. 改善履歴と最適化

### 7.1 リファクタリング前後の比較

#### **Before（初期実装）: 671行**

**問題点**:
- 関数の重複（プレイヤー用・コンピューター用で別々）
- 音声再生関数が5つ存在
- 日本語のローマ字変数名
- `var`の使用

**例**:
```javascript
// 重複していた関数
function surottoWoMawasu(surottoNo) { /* ... */ }
function aiteSurottoWoMawasu(surottoNo) { /* ... */ }

// 個別の音声関数
function stopOtoWoNarasu() { /* ... */ }
function startOtoWoNarasu() { /* ... */ }
function winOtoWoNarasu() { /* ... */ }
function loseOtoWoNarasu() { /* ... */ }
function drawOtoWoNarasu() { /* ... */ }
```

---

#### **After（リファクタリング後）: 349行**

**改善内容**:
1. **関数の統合**: 10個 → 7個（30%削減）
2. **コード行数**: 671行 → 349行（48%削減）
3. **変数名の英語化**: 可読性向上
4. **モダンJS**: `const`/`let`、テンプレートリテラル、アロー関数

**例**:
```javascript
// 統合された関数
function spinSlot(slotNum, prefix, timers) {
  // prefixで切り替え
}

// 統合された音声関数
function playSound(type) {
  const sounds = { /* データ駆動 */ };
  sounds[type].forEach(/* ... */);
}
```

---

### 7.2 パフォーマンス最適化

#### **最適化1: DOM要素のキャッシュ**

**Before**:
```javascript
// 毎回DOM検索
document.getElementById("kekkaHyouji").textContent = "";
document.getElementById("kekkaHyouji").classList.remove("hyouji-chuu");
```

**After**:
```javascript
// 変数に格納
const resultElement = document.getElementById("kekkaHyouji");
resultElement.textContent = "";
resultElement.classList.remove("hyouji-chuu");
```

**効果**: DOM検索回数を削減

---

#### **最適化2: 配列操作の効率化**

**Before**:
```javascript
var guuKazu = 0;
var chokiKazu = 0;
var paaKazu = 0;
for (var i = 0; i < kekkaHairetsu.length; i++) {
  if (kekkaHairetsu[i] === "guu") guuKazu++;
  // ...
}
```

**After**:
```javascript
const counts = { rock: 0, paper: 0, scissors: 0 };
results.forEach(hand => counts[hand]++);
const maxCount = Math.max(...Object.values(counts));
```

**効果**: コードの簡潔化と可読性向上

---

#### **最適化3: CSSアニメーションの活用**

**JavaScript**:
```javascript
// クラスの追加・削除のみ
slot.classList.add("kaiten-chuu");
slot.classList.remove("kaiten-chuu");
```

**CSS**:
```css
/* ブラウザのGPUで処理 */
@keyframes furueru {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
}
```

**効果**: GPUアクセラレーションによる滑らかなアニメーション

---

### 7.3 今後の改善案

#### **機能追加**
1. **スコア履歴**: 複数ラウンドの記録
2. **難易度設定**: コンピューターの強さ調整
3. **サウンドON/OFF**: ユーザー設定
4. **レスポンシブ対応**: スマートフォン最適化

#### **技術的改善**
1. **TypeScriptへの移行**: 型安全性の向上
2. **モジュール化**: ES Modulesの採用
3. **テストコード**: Jest等でユニットテスト
4. **状態管理ライブラリ**: 複雑化した場合

#### **コード品質**
1. **ESLintの導入**: コーディング規約の統一
2. **Prettierの導入**: フォーマット自動化
3. **JSDocの追加**: 関数の型情報記述
4. **パフォーマンス計測**: Chrome DevToolsでの分析

---

## 8. まとめ

### 8.1 プロジェクトの強み

✅ **シンプルで理解しやすい構造**  
✅ **効率的なコード（349行で全機能を実現）**  
✅ **外部依存なし（Vanilla JavaScript）**  
✅ **適切なコメント（各セクションに説明）**  
✅ **モダンなJavaScript構文**  
✅ **ユーザー体験への配慮（音声・アニメーション）**

### 8.2 学習ポイント

このプロジェクトから学べること:
- 非同期処理の管理（setTimeout/setInterval）
- 状態管理の基礎
- DOM操作の効率化
- Web Audio APIの使用
- CSSアニメーションとの連携
- コードリファクタリングの実践

### 8.3 ベストプラクティス

1. **関数は単一責任**: 各関数が1つの明確な役割を持つ
2. **データとロジックの分離**: 音声パターンをデータ化
3. **汎用関数の活用**: コードの重複を避ける
4. **適切なコメント**: コードの意図を明確に
5. **段階的な改善**: 動作確認しながらリファクタリング

---

**作成日**: 2025年11月21日  
**バージョン**: 1.0  
**対象コード**: じゃんけんスロットゲーム（リファクタリング後）

