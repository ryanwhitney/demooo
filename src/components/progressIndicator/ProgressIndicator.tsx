import React, { useEffect, useState } from 'react'

function ProgressIndicator(): React.ReactNode {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      if (dots.length > 4) {
        setDots("")
      } else {
        setDots((prevDots) => (prevDots + "."))
      }
    }, 300)

    return () => clearInterval(interval)
  }, [dots])

  return dots
}

export default ProgressIndicator
