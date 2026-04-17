export default function MapSection() {
  return (
    <section className="section-light" id="ban-do">
      <div className="container">
        <div className="sec-head" data-aos="fade-up">
          <h2 className="sec-title">Địa Điểm Tổ Chức</h2>
          <div className="sec-bar"></div>
        </div>

        <div className="map-card" data-aos="fade-up" data-aos-delay="100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.963040057755!2d106.80790350000001!3d10.814140400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175273243cb65d9%3A0x5913954ca65f9f1f!2zVHLGsOG7nW5nIMSQSCBUw6BpIGNow61uaCAtIE1hcmtldGluZyAoQ8ahIHPhu58gTG9uZyBUcsaw4budbmcp!5e0!3m2!1svi!2s!4v1776326358952!5m2!1svi!2s"
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bản đồ địa điểm tổ chức"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
