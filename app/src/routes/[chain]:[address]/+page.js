export const load = async ({ params }) => {
  return {
    chain: parseInt(params.chain),
    address: params.address
  }
}
