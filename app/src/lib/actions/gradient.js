function hash(number) {
  let hash = number || Math.floor(Math.random() * 255)
  for (let i = 0; i < 5; i++) {
    hash = (hash * 137) % 360
  }
  return hash
}

export const gradient = (node) => {
  const number = node.getAttribute('data-hashed')

  console.log(
    'gradient',
    node.getAttribute('data-startColor'),
    node.getAttribute('data-endColor')
  )

  const startColor = node.getAttribute('data-startColor') || hash(number)
  const endColor = node.getAttribute('data-endColor') || hash(startColor)

  console.log('gradient', { startColor, endColor })

  if (node.getAttribute('data-startColor')) {
    node.style.background = `linear-gradient(135deg, #000000, #ffffff);`
    // linear-gradient(135deg, hsl(0%, 0%, ${startColor}), hsl(0%, 0%, ${endColor}))`
  } else {
    node.style.background = `linear-gradient(135deg, hsl(${startColor}, 100%, 50%), hsl(${endColor}, 100%, 50%))`
  }
}
