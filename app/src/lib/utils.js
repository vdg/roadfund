import { utils } from 'ethers'

export const explorer = (chainData, type, id) => {
  if (chainData.explorers && chainData.explorers.length) {
    return `${chainData.explorers[0]?.url}/${type}/${id}`
  } else {
    return '#'
  }
}

export const formatAddress = (a = '', short = true) => {
  try {
    a = utils.getAddress(a)
    return short && a ? a.substr(0, 6) + '...' + a.substr(38, 4) : a
  } catch (e) {
    return ''
  }
}

export const fromWei = (s) => {
  if (s == null) return ''
  return Math.round(utils.formatEther(s) * 1e5) / 1e5
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
