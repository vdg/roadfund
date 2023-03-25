import parse from 'parse-duration'

export const duration = (str) => Math.round(parse(str) / 1000)

export const increaseTime = (any) => {
  const delta = /\w/.test(any) ? duration(any) : delta
  return hre.network.provider.send('evm_increaseTime', [delta])
}
