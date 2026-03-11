# 🚀 Solana 学习记录（solana-18hours-practice）

>视频教程：https://learnblockchain.cn/course/69

## 📖 学习进度导航

| 项目编号 | 项目名称        | 核心知识点       | 状态 | 链接                     |
|:-----|:------------|:------------| :--- |:-----------------------|
| 01   | voting-dapp | 投票应用        | ✅ 完成 | [查看代码](./voting-dapp/) |
| 02   | crud-app    | 增删改查应用      | ✅ 完成 | [查看代码](./crud-app/)    |
| 03   | new-token   | 通过命令创建token | ✅ 完成 | [查看代码](./new-token/)   |
| 03   | swap        | swap兑换功能    | ✅ 完成 | [查看代码](./swap/)        |

## 🛠 技术栈
- **链端 (On-chain)**: Rust, Anchor Framework
- **客户端 (Client)**: React, Next.js, @solana/web3.js, @coral-xyz/anchor
- **环境**: surfpool-localnet


## 📒 笔记
### 03 new-token命令
```shell
# 初始化代币
spl-token initialize-metadata ${token_address} ${token_name} ${token_symbol} ${metadata.json}
# eg
spl-token initialize-metadata mntynMwSZoZyAqN3jntSBvqXphyqZy6LkixFkmWwgCG 'ExampleToken' 'ET' https://gateway.pinata.cloud/ipfs/QmbF5wn3SLNyyw9jhsHa5kW14MPyzcQB9GcszeQbpy5qT9

# 创建ATA
spl-token create-account ${token_address}
# eg
spl-token create-account mntynMwSZoZyAqN3jntSBvqXphyqZy6LkixFkmWwgCG

# 铸造代币
spl-token mint {token_address} ${amount}
# eg
spl-token mint mntynMwSZoZyAqN3jntSBvqXphyqZy6LkixFkmWwgCG 1000

```