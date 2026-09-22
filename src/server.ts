import {createApp} from './app';
import {config} from './config';

createApp().listen(config.port, () => {
    console.log(`CPS service listening on port ${config.port}`);
});
