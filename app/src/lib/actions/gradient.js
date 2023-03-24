function hash(number) {
  let hash = number
  for (let i = 0; i < 5; i++) {
    hash = (hash * 137) % 360
  }
  return hash
}

export const gradient = (node) => {
  const number = node.getAttribute('data-gradient')
  const startColor = hash(number)
  const endColor = hash(startColor)

  node.style.background = `linear-gradient(135deg, hsl(${startColor}, 100%, 50%), hsl(${endColor}, 100%, 50%))`
}
