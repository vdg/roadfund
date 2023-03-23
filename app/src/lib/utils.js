export const explorer = (chainData, type, id) => {
  if (chainData.explorers && chainData.explorers.length) {
    return `${chainData.explorers[0]?.url}/${type}/${id}`
  } else {
    return '#'
  }
}

export const keyDownA11y = (handler) => {
  return function onKeyDown(event) {
    if (
      ['keydown', 'keypress'].includes(event.type) &&
      ['Enter', ' '].includes(event.key)
    ) {
      handler()
    }
  }
}
