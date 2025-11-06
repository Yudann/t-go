import Image from "next/image";

const AboutSection = () => {
  const aboutCards = [
    {
      title: "Kenapa T-GO?",
      content:
        "Transportasi umum di Tangerang, terutama angkot belum memiliki jadwal dan rute yang pasti. Banyak penumpang kesulitan memperkirakan waktu keberangkatan, sementara pengemudi pun tidak memiliki sistem yang teratur. Dari masalah itu, lahirlah T-GO, aplikasi yang terinspirasi dari sistem JakLingko, menghadirkan konsep angkot dengan rute dan jadwal teratur.",
    },
    {
      title: "Logo T-GO",
      image: "/logo.png",
      content:
        "Logo T-GO menampilkan gambar angkot berwarna ungu sebagai ikon utama yang merepresentasikan transportasi khas Tangerang. Di bawahnya terdapat tulisan T-GO, dengan huruf 'O' yang terinspirasi dari roda angkot sebagai simbol pergerakan dan perubahan menuju sistem transportasi yang lebih baik. Logo ini menggambarkan semangat mobilitas, konektivitas, dan identitas lokal Tangerang.",
    },
    {
      title: "Visi & Misi T-GO",
      content:
        "Visi T-GO adalah mewujudkan transportasi angkot Tangerang yang tertata, modern, dan terintegrasi secara digital. Untuk mencapai visi tersebut, T-GO berkomitmen menyediakan sistem rute dan jadwal angkot yang jelas dan konsisten, menghubungkan penumpang serta pengemudi melalui platform digital yang mudah digunakan, meningkatkan efisiensi dan kenyamanan perjalanan masyarakat Tangerang, serta mendukung digitalisasi transportasi lokal menuju kota yang lebih cerdas dan teratur.",
    },
  ];

  return (
    <section
      id="tentang"
      className="relative pt-24 py-16 flex items-center justify-center overflow-hidden bg-bg-body"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase text-center mb-12 text-gradient-purple tracking-wide">
          Tentang T-GO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {aboutCards.map((card, index) => (
            <div
              key={index}
              className="bg-border-color rounded-2xl border border-primary/30 p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-2xl hover:shadow-primary/30 min-h-[300px] flex flex-col justify-center items-center"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-primary-darker mb-4">
                {card.title}
              </h3>

              {card.image && (
                <Image
                  src={card.image}
                  alt="T-GO Logo"
                  width={120}
                  height={120}
                  className="mb-4 w-2/5 h-auto"
                />
              )}

              <p className="text-text-primary text-sm md:text-base leading-loose text-justify font-medium">
                {card.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
