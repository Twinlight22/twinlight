export default function ContactLink() {
  return (
    <div style={{
      position: "absolute",
      bottom: "20px",
      width: "100%",
      textAlign: "center",
    }}>
      <a
        href="mailto:info@twinlight.jp"
        style={{
          fontSize: "12px",
          color: "rgba(255, 255, 221, 0.6)",
          textDecoration: "underline",
          transition: "color 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255, 255, 221, 0.8)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255, 255, 221, 0.6)";
        }}
      >
        お問い合わせはこちら
      </a>
    </div>
  );
}