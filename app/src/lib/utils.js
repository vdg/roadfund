export const explorer = (chainData, type, id) => {
  if (chainData.explorers && chainData.explorers.length) {
    return `${chainData.explorers[0]?.url}/${type}/${id}`
  } else {
    return '#'
  }
}
