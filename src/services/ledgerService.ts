/**
 * REC-GUARD AI - Permissioned DLT Ledger Service
 * Simulates a tamper-evident cryptographically chained ledger compatible with Hyperledger Fabric
 */

import { LedgerBlock, RECRecord } from '../types';
import { fallbackSha256 } from './cryptoService';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function computeBlockHash(
  blockNumber: number,
  previousHash: string,
  timestamp: string,
  actor: string,
  recId: string,
  event: string,
  payload: Record<string, any>
): string {
  const payloadStr = JSON.stringify(payload);
  const data = `${blockNumber}|${previousHash}|${timestamp}|${actor}|${recId}|${event}|${payloadStr}`;
  return fallbackSha256(data);
}

export class LedgerService {
  private blocks: LedgerBlock[] = [];

  constructor() {
    this.initializeGenesis();
  }

  private initializeGenesis(): void {
    const genesisTime = '2026-08-01T00:00:00Z';
    const genesisPayload = { network: 'REC-GUARD-CONSORTIUM-DLT', channel: 'clean-energy-ledger-v1' };
    const hash = computeBlockHash(0, GENESIS_HASH, genesisTime, 'SYSTEM_GENESIS', 'GENESIS', 'CREATED', genesisPayload);
    
    this.blocks = [
      {
        blockNumber: 0,
        transactionId: 'TX-GENESIS-0000',
        timestamp: genesisTime,
        actor: 'SYSTEM_GENESIS',
        recId: 'SYS-ROOT',
        event: 'CREATED',
        previousHash: GENESIS_HASH,
        currentHash: hash,
        status: 'VALID',
        dataPayload: genesisPayload
      }
    ];
  }

  public getBlocks(): LedgerBlock[] {
    return [...this.blocks];
  }

  public setBlocks(blocks: LedgerBlock[]): void {
    this.blocks = [...blocks];
  }

  public appendBlock(
    actor: string,
    recId: string,
    event: 'CREATED' | 'ISSUED' | 'TRANSFERRED' | 'RETIRED',
    payload: Record<string, any>,
    timestamp?: string
  ): LedgerBlock {
    const lastBlock = this.blocks[this.blocks.length - 1];
    const prevHash = lastBlock ? lastBlock.currentHash : GENESIS_HASH;
    const blockNum = this.blocks.length;
    const time = timestamp || new Date().toISOString();
    const txId = `TX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const currentHash = computeBlockHash(blockNum, prevHash, time, actor, recId, event, payload);

    const newBlock: LedgerBlock = {
      blockNumber: blockNum,
      transactionId: txId,
      timestamp: time,
      actor,
      recId,
      event,
      previousHash: prevHash,
      currentHash,
      status: 'VALID',
      dataPayload: payload
    };

    this.blocks.push(newBlock);
    return newBlock;
  }

  public verifyChainIntegrity(): {
    isValid: boolean;
    brokenBlockNumber?: number;
    reason?: string;
    totalBlocksVerified: number;
  } {
    if (this.blocks.length === 0) {
      return { isValid: true, totalBlocksVerified: 0 };
    }

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];

      // Verify link to previous block
      if (i > 0) {
        const prevBlock = this.blocks[i - 1];
        if (block.previousHash !== prevBlock.currentHash) {
          return {
            isValid: false,
            brokenBlockNumber: block.blockNumber,
            reason: `Broken chain link at Block #${block.blockNumber}. Recorded previousHash does not match Block #${prevBlock.blockNumber}'s currentHash.`,
            totalBlocksVerified: i
          };
        }
      }

      // Recompute and verify current block's hash
      const expectedHash = computeBlockHash(
        block.blockNumber,
        block.previousHash,
        block.timestamp,
        block.actor,
        block.recId,
        block.event,
        block.dataPayload
      );

      if (expectedHash !== block.currentHash) {
        return {
          isValid: false,
          brokenBlockNumber: block.blockNumber,
          reason: `Tamper Detected at Block #${block.blockNumber}! Payload or metadata has been altered. Expected: ${expectedHash.slice(0, 16)}..., Found: ${block.currentHash.slice(0, 16)}...`,
          totalBlocksVerified: i
        };
      }
    }

    return {
      isValid: true,
      totalBlocksVerified: this.blocks.length
    };
  }

  public tamperBlockPayload(blockNumber: number, alteredField: string, fakeValue: any): boolean {
    const block = this.blocks.find(b => b.blockNumber === blockNumber);
    if (!block) return false;
    block.dataPayload = {
      ...block.dataPayload,
      [alteredField]: fakeValue,
      _unauthorized_modification: true
    };
    block.status = 'TAMPERED';
    return true;
  }

  public restoreBlock(blockNumber: number, originalPayload: Record<string, any>): boolean {
    const block = this.blocks.find(b => b.blockNumber === blockNumber);
    if (!block) return false;
    block.dataPayload = originalPayload;
    block.status = 'VALID';
    return true;
  }
}

export const ledgerSingleton = new LedgerService();
