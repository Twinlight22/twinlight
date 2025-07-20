// audio-reverb-processor.cjs
// SoXでリバーブ効果を追加するシンプル版

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🏛️ リバーブ処理ツール開始');

async function addReverb(inputFile, outputFile, level = 50) {
  console.log(`🎙️ リバーブレベル ${level} で処理中...`);
  
  return new Promise((resolve, reject) => {
    const sox = spawn('sox', [inputFile, outputFile, 'reverb', level.toString()]);
    
    sox.on('close', (code) => {
      if (code === 0) {
        console.log('✅ リバーブ処理完了:', outputFile);
        resolve(outputFile);
      } else {
        console.error('❌ SoX処理失敗');
        reject(new Error(`SoX failed with code ${code}`));
      }
    });
    
    sox.on('error', (error) => {
      console.error('❌ SoXエラー:', error.message);
      reject(error);
    });
  });
}

async function processLatestAudio() {
  const testDir = './test-audio';
  
  // Google TTSファイルを探す
  const files = fs.readdirSync(testDir)
    .filter(file => file.startsWith('google_tts_') && file.endsWith('.mp3'))
    .sort();
  
  if (files.length === 0) {
    console.error('❌ Google TTSファイルが見つかりません');
    return;
  }
  
  const latestFile = files[files.length - 1];
  const inputPath = path.join(testDir, latestFile);
  const outputPath = path.join(testDir, `reverb_${latestFile}`);
  
  console.log('📁 処理対象:', latestFile);
  
  try {
    await addReverb(inputPath, outputPath, 50);
    console.log('🎉 完了！音声ファイルを確認してください');
  } catch (error) {
    console.error('❌ 処理失敗:', error.message);
  }
}

// 実行
processLatestAudio();