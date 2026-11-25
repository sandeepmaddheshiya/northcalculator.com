import type { ComputeFn, ComputeResult } from '@/calculators/types';
import { clean } from '@/engine/money';

/**
 * Ideal transformer (OpenStax College Physics 2e Eqs. 23.26–23.29; University Physics Vol. 2
 * Eqs. 15.21–15.23): V_s ÷ V_p = N_s ÷ N_p and, with power conserved, I_s ÷ I_p = N_p ÷ N_s.
 * Solves for the secondary voltage from the turns, or the secondary turns from the voltages, and
 * converts a known current on either side. Real transformers lose a few percent to heat.
 */
export const compute: ComputeFn = (inputs, ctx) => {
  const { fmt } = ctx;
  const tr = ctx.t ?? ((k: string) => k);
  const num = (k: string) => (typeof inputs[k] === 'number' ? (inputs[k] as number) : null);
  const none = (key?: string): ComputeResult => ({
    outputs: { result: null },
    steps: [],
    warnings: key ? [{ key, level: 'warn' }] : [],
  });
  const findTurns = inputs.find === 'ns';
  const Vp = num('vp');
  const Np = num('np');
  if (Vp === null || Np === null) return none();
  if (!(Vp > 0) || !(Np > 0)) return none('warn.positive');
  let Vs: number;
  let Ns: number;
  if (findTurns) {
    const v = num('vs');
    if (v === null) return none();
    if (!(v > 0)) return none('warn.positive');
    Vs = v;
    Ns = (Np * Vs) / Vp;
  } else {
    const n = num('ns');
    if (n === null) return none();
    if (!(n > 0)) return none('warn.positive');
    Ns = n;
    Vs = (Vp * Ns) / Np;
  }
  const ratio = Ns / Np;
  const I = num('current');
  const side = inputs.side === 's' ? 's' : 'p';
  const Ip = I === null ? null : side === 'p' ? I : I * ratio;
  const Is = I === null ? null : side === 's' ? I : I / ratio;
  const power = Ip === null ? null : Ip * Vp;
  const s = (x: number) => fmt.sig(clean(x), 6);
  const kind = ratio > 1 ? 'kind.up' : ratio < 1 ? 'kind.down' : 'kind.iso';
  const steps: ComputeResult['steps'] = [
    findTurns
      ? { key: 'step.ns', math: `${s(Np)} × ${s(Vs)} ÷ ${s(Vp)} = ${s(Ns)}` }
      : { key: 'step.vs', math: `${s(Vp)} × ${s(Ns)} ÷ ${s(Np)} = ${s(Vs)} V` },
  ];
  if (Ip !== null && Is !== null)
    steps.push(
      side === 'p'
        ? { key: 'step.is', math: `${s(Ip)} × ${s(Np)} ÷ ${s(Ns)} = ${s(Is)} A` }
        : { key: 'step.ip', math: `${s(Is)} × ${s(Ns)} ÷ ${s(Np)} = ${s(Ip)} A` },
      { key: 'step.p', math: `${s(Ip)} A × ${s(Vp)} V = ${s(power!)} W` },
    );
  const warnings: ComputeResult['warnings'] = [];
  if (findTurns && Math.abs(Ns - Math.round(Ns)) > 1e-6 * Ns)
    warnings.push({ key: 'warn.whole', level: 'info', values: { n: fmt.int(Math.round(Ns)) } });

  return {
    outputs: {
      result: clean(findTurns ? Ns : Vs),
      kind: tr(kind),
      ratio: clean(ratio),
      vs: clean(Vs),
      ns: clean(Ns),
      ip: Ip === null ? null : clean(Ip),
      is: Is === null ? null : clean(Is),
      power: power === null ? null : clean(power),
    },
    explain: {
      key: ratio === 1 ? 'explain.iso' : 'explain',
      values: { kind: tr(kind).toLowerCase(), r: s(ratio >= 1 ? ratio : 1 / ratio), vs: s(Vs) },
    },
    steps,
    warnings,
  };
};
