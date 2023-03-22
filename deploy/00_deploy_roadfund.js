import hre from "hardhat";

const deploy = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer, RougeSingleton, RougeProxyFactory } =
    await getNamedAccounts();

  const balance = await ethers.provider.getBalance(deployer);
  console.log("deployer is %s %s", deployer, balance);

  const roadfund = await deploy("Roadfund", {
    from: deployer,
    args: [RougeProxyFactory, RougeSingleton],
    log: true,
  });
};

export default deploy;

export const tags = ["Roadfund"];
