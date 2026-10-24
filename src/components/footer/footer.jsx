
import { AudioLines } from 'lucide-react';
import { Link } from 'react-router-dom';
import './footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Link to="/" className="footer-brand">
          <span className="footer-brand-icon">
            <AudioLines size={19} />
          </span>
          vydora
        </Link>

        <p>Make more room for listening.</p>

        <span className="footer-copyright">
          © {new Date().getFullYear()} Vydora
        </span>
      </div>
    </footer>
  );
}

export default Footer;
