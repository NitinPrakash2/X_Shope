import { createApp } from "vue";
import type { _p_TYP, _pp_TYP } from "../shared/types";
import Comp from "./index.vue";

const index = async (_p: _p_TYP) => {
    return {
        set: async (_pp: _pp_TYP) => {
            console.log(`--X Shop Hydrator [${_pp["data"]["curr"].type}]`);

            // Create Vue app with props
            const props = {
                _p: _p,
                _pp: _pp,
            };
            
            const app = createApp(Comp, props);

            // Mount to element
            const mountEl = document.getElementById(_p.f.name("vue-root"));
            if (mountEl) {
                app.mount(mountEl);
                console.log('X Shop App mounted successfully');
            } else {
                console.error('Mount element not found');
            }

            return {
                r: "",
                style: "",
                evt: {
                    change: () => {
                        console.log('X Shop state changed');
                    }
                }
            };
        },
    };
};

export { index, index as hydrator };
