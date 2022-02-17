
import { createTypedHooks } from "easy-peasy";
import { AuthStore } from "../store";

const hooks = createTypedHooks<{ auth: AuthStore }>();

export const useStore = hooks.useStore;
export const useStoreState = hooks.useStoreState;
export const useStoreActions = hooks.useStoreActions;
export const useStoreDispatch = hooks.useStoreDispatch;