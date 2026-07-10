import { BrainDecision } from "@/lib/brain/brain";

export type OracleMessage = {
  title: string;
  message: string;
};

export function consultOracle(
  decision: BrainDecision
): OracleMessage {
  return {
    title: decision.oracleTitle,
    message: decision.oracleMessage,
  };
}