const ProfileGrainSVG = () => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <filter id="noise">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="5"
        numOctaves="10"
        stitchTiles="stitch"
      />
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 1 0"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" opacity="0.25" />
  </svg>
);

export default ProfileGrainSVG;
