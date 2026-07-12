import { CortexDecision } from "@/lib/cortex";

export type OracleMessage = {
  title: string;
  message: string;
};

export function consultOracle(
  decision: CortexDecision
): OracleMessage {
  return {
    title: decision.oracleTitle,
    message: decision.oracleMessage,
  };
}