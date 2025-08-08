import React from 'react';
import "./Tokushoho.css";

const Tokushoho = () => {
  return (
    <div className="tokushoho-container">
      <div className="tokushoho-content">
        <h1 className="tokushoho-title">特定商取引法に基づく表記</h1>
        
        <div className="tokushoho-section">
          <h3>事業者名</h3>
          <p>ツインライト</p>
        </div>

        <div className="tokushoho-section">
          <h3>運営責任者</h3>
          <p>松原亜紀</p>
        </div>

        <div className="tokushoho-section">
          <h3>住所</h3>
          <p>〒210-0833 神奈川県川崎市川崎区桜本２−２５−３</p>
        </div>

        <div className="tokushoho-section">
          <h3>連絡先</h3>
          <p>メールアドレス: info@twinlight.jp</p>
          <p>お問い合わせは上記メールアドレスまでご連絡ください。</p>
        </div>

        <div className="tokushoho-section">
          <h3>サービス名</h3>
          <p>はじめてのAI副収入ナビ</p>
        </div>

        <div className="tokushoho-section">
          <h3>サービス内容</h3>
          
          <div className="service-category">
            <h4>無料版</h4>
            <ul>
              <li>AI副業診断（TOP3のみ表示）</li>
              <li>診断の採点内容</li>
            </ul>
          </div>

          <div className="service-category">
            <h4>プレミアム版</h4>
            <ul>
              <li>AI副業診断（全13職種詳細表示）</li>
              <li>診断の採点内容</li>
              <li>各種アカウント開設ナビ</li>
              <li>専用学習コンテンツ</li>
            </ul>
          </div>

          <div className="service-category">
            <h4>オプション版</h4>
            <ul>
              <li>Zoomサポート</li>
              <li>個別相談</li>
              <li>伴走</li>
            </ul>
          </div>
        </div>

        <div className="tokushoho-section">
          <h3>料金</h3>
          <p>無料版: 0円</p>
          <p>プレミアム版: 月額1,980円（税込）</p>
          <p>オプション版: 応相談</p>
        </div>

        <div className="tokushoho-section">
          <h3>返品・交換について</h3>
          <p>デジタルコンテンツの性質上、原則として返品・交換はお受けできません。</p>
        </div>

        <div className="tokushoho-section">
          <h3>免責事項</h3>
          <p>
            本サービスの診断結果は参考情報であり、副業の成功を保証するものではありません。<br />
            副業を始める際は、各自の責任において十分な検討を行ってください。
          </p>
        </div>

        <div className="tokushoho-section">
          <h3>準拠法・管轄裁判所</h3>
          <p>
            本規約に関する準拠法は日本法とし、紛争が生じた場合は<br />
            神奈川県川崎市の管轄裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </div>

        <div className="tokushoho-footer">
          <p>制定日: 2025年8月8日</p>
        </div>
      </div>
    </div>
  );
};

export default Tokushoho;
