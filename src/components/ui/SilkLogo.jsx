export default function SilkLogo({ size = 36 }) {
  return (
    <img
      src="/images/silksphere-logo.png"
      alt="SilkSphere Logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain', borderRadius: 4 }}
    />
  )
}
