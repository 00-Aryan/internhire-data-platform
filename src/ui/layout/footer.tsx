import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-black py-1">
      <div className="flex flex-wrap items-center justify-center">
        <Link
          href="/legal/about"
          className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300"
        >
          About
        </Link>

        <Link
          href="/legal/privacy"
          className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300"
        >
          Privacy
        </Link>

        <Link
          href="/legal/terms"
          className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300"
        >
          Terms
        </Link>

        <Link
          href="/legal/contact-us"
          className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300"
        >
          Contact Us
        </Link>

        <Link
          href="/legal/shipping-policy"
          className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300"
        >
          Shipping Policy
        </Link>
        <Link
          href="/legal/refund-policy"
          className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300"
        >
          Refund Policy
        </Link>
      </div>
    </footer>
  )
}
