import { BuyTokensRequest } from '../types/BuyTokensRequest';
import { BuyTokensResponse } from '../types/BuyTokensResponse';
import { Config } from '../types/Config';
import { ContractInformation } from '../types/ContractInformation';
import { TokenInformation } from '../types/TokenInformation';
import { UpdateBuyTokenRequest } from '../types/UpdateBuyTokenRequest';
import { EVMSignature } from '../types/EVMSignature';

export class HMAPI {
    public static async getContract(
        config: Config
    ): Promise<ContractInformation> {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/contract/${
            config.contractId
        }`;

        const result: ContractInformation = await (await fetch(url)).json();

        const dateFields = ['presaleAt', 'publicSaleAt', 'saleClosesAt'];

        for (const field of dateFields) {
            if (result[field]) {
                result[field] = new Date(result[field]);
            }
        }

        return result;
    }

    public static async getTokens(config: Config): Promise<TokenInformation[]> {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/contract/${
            config.contractId
        }/tokens`;

        return (await fetch(url)).json();
    }

    public static async getToken(
        config: Config,
        tokenId: number
    ): Promise<TokenInformation> {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/contract/${
            config.contractId
        }/tokens/${tokenId}`;

        return (await fetch(url)).json();
    }

    public static async getSolanaApproveInstruction(
        config: Config,
        destination: string,
        tokenId = 1,
        amount = 1
    ): Promise<BuyTokensResponse> {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/buy-solana`;

        const data: BuyTokensRequest = {
            destination,
            tokenId,
            amount,
            contractId: config.contractId
        };

        const result = await (
            await fetch(url, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        ).json();

        if (result.error) {
            throw new Error(result.error);
        }

        return result;
    }

    public static async updateSolanaBuyRequest(
        config: Config,
        mintId: string,
        transactionHash: string
    ): Promise<boolean> {
        const url = `${HMAPI.getHMBaseUrl(config)}/client/buy-solana`;

        const data: UpdateBuyTokenRequest = {
            mintId,
            transactionHash
        };

        return (
            await fetch(url, {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
        ).json();
    }

    public static async getEVMPresaleAuthorisation(
        config: Config,
        tokenId: number,
        address: string
    ): Promise<EVMSignature> {
        const url = `${HMAPI.getHMBaseUrl(
            config
        )}/client/authorise-evm-presale/${
            config.contractId
        }/${tokenId}/${address}`;

        return (await fetch(url)).json();
    }

    private static getHMBaseUrl(config: Config) {
        return config.hmURL ?? 'https://api.hypermint.com';
    }
}