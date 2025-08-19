import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{
      fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif",
      lineHeight: 1.8,
      color: '#333',
      background: '#f8f9fa',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        {/* ヘッダー */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          borderBottom: '3px solid #4285f4',
          paddingBottom: '20px'
        }}>
          <h1 style={{
            color: '#333',
            fontSize: '1.8rem',
            fontWeight: 600,
            margin: 0
          }}>
            プライバシーポリシー
          </h1>
        </div>

        {/* 最終更新日 */}
        <div style={{
          textAlign: 'right',
          marginBottom: '30px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          最終更新日：2025年8月9日
        </div>

        {/* 1. 個人情報の取得について */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            個人情報の取得について
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              当サービスでは、以下の個人情報を取得いたします：
            </p>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li style={{ margin: '5px 0' }}>LINEユーザーID</li>
              <li style={{ margin: '5px 0' }}>診断結果データ</li>
              <li style={{ margin: '5px 0' }}>サービス利用履歴</li>
              <li style={{ margin: '5px 0' }}>お問い合わせ時の連絡先情報</li>
            </ul>
          </div>
        </section>

        {/* 2. 個人情報の利用目的 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            個人情報の利用目的
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              取得した個人情報は、以下の目的で利用いたします：
            </p>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li style={{ margin: '5px 0' }}>サービスの提供・運営</li>
              <li style={{ margin: '5px 0' }}>診断結果の提供</li>
              <li style={{ margin: '5px 0' }}>サービスの改善・向上</li>
              <li style={{ margin: '5px 0' }}>お客様からのお問い合わせへの対応</li>
              <li style={{ margin: '5px 0' }}>利用規約違反への対応</li>
            </ul>
          </div>
        </section>

        {/* 3. 個人情報の第三者提供 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            個人情報の第三者提供
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              当サービスは、以下の場合を除き、個人情報を第三者に提供することはありません：
            </p>
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li style={{ margin: '5px 0' }}>お客様の同意がある場合</li>
              <li style={{ margin: '5px 0' }}>法令に基づく場合</li>
              <li style={{ margin: '5px 0' }}>人の生命、身体または財産の保護のために必要がある場合</li>
              <li style={{ margin: '5px 0' }}>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
            </ul>
          </div>
        </section>

        {/* 4. 個人情報の安全管理 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            個人情報の安全管理
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              当サービスは、個人情報の漏洩、滅失、毀損を防止するため、適切な安全管理措置を講じます。また、個人情報の取扱いに関して、従業員に対し適切な監督を行います。
            </p>
          </div>
        </section>

        {/* 5. Cookieの使用について */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            Cookieの使用について
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              当サービスでは、サービスの利便性向上のためCookieを使用する場合があります。Cookieを無効にした場合、サービスの一部機能が利用できない可能性があります。
            </p>
          </div>
        </section>

        {/* 6. 個人情報の開示・訂正・削除について */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            個人情報の開示・訂正・削除について
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              お客様は、当サービスが保有する個人情報について、開示・訂正・削除を求めることができます。ご希望の場合は、下記連絡先までお問い合わせください。
            </p>
          </div>
        </section>

        {/* 7. LINEプラットフォームについて */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            LINEプラットフォームについて
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              本サービスはLINEプラットフォームを利用しています。LINE株式会社のプライバシーポリシーについては、同社の公式サイトをご確認ください。
            </p>
          </div>
        </section>

        {/* 8. プライバシーポリシーの変更 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            プライバシーポリシーの変更
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              当プライバシーポリシーは、法令の変更やサービス内容の変更に伴い、予告なく変更する場合があります。変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。
            </p>
          </div>
        </section>

        {/* 9. 連絡先 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            連絡先
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              メールアドレス: info@twinlight.jp
            </p>
            <p style={{ margin: '10px 0', color: '#555' }}>
              お問い合わせは上記メールアドレスまでご連絡ください。
            </p>
          </div>
        </section>

        {/* サービス名 */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#4285f4',
            fontSize: '1.1rem',
            marginBottom: '15px',
            fontWeight: 600
          }}>
            サービス名
          </h2>
          <div style={{
            marginLeft: '20px',
            borderLeft: '3px solid #e3f2fd',
            paddingLeft: '20px'
          }}>
            <p style={{ margin: '10px 0', color: '#555' }}>
              はじめてのAI副収入ナビ
            </p>
          </div>
        </section>

     {/* 戻るボタン */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => window.close()}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3367d6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4285f4';
            }}
          >
            アプリに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;