// Every easter-egg effect shares this contract: the button owns activation
// state and asks an effect to wind itself down (rather than yanking it out
// of the tree) so effects that displaced real layout can animate back to
// their original spot before unmounting.
export type EasterEggEffectProps = {
  closing: boolean;
  onFinished: () => void;
};
