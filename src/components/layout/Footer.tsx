import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white py-10 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          {/* Company Info */}
          <div className="flex-1">
            <Image
              src="/logo.png"
              alt="T-GO Logo"
              width={90}
              height={90}
              className="mb-4"
            />
            <h3 className="text-lg font-bold mb-2">PT TANGERANG GO</h3>
            <p className="text-sm">Jl. Sahabat No. 123, Tangerang</p>
          </div>

          {/* Contact Info */}
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-4">KONTAK</h4>
            <div className="space-y-2">
              <p className="flex items-center text-sm">
                <span className="w-6 mr-2">📱</span>
                081234567890
              </p>
              <p className="flex items-center text-sm">
                <span className="w-6 mr-2">✉️</span>
                sahabattgo@gmail.com
              </p>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex-1">
            <h4 className="text-lg font-bold mb-4">MEDIA SOSIAL</h4>
            <p className="flex items-center text-sm">
              <span className="w-6 mr-2">📷</span>
              @tgo_id
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/30 pt-6 text-right">
          <p className="text-sm">
            Hak Cipta &copy; 2025 PT TANGERANG GO
            <br />
            Dilindungi Undang-Undang
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
