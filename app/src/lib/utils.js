import { utils } from 'ethers'

export const explorer = (chainData, type, id) => {
  if (chainData.explorers && chainData.explorers.length) {
    return `${chainData.explorers[0]?.url}/${type}/${id}`
  } else {
    return '#'
  }
}

export const toWei = (s) => {
  let wei = utils.parseUnits((s + '').split(' ').join(''), 18)
  return wei
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
