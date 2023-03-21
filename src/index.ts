#!/usr/bin/env node

import { tendr } from './lib/tendr';


tendr(process.argv.slice(2)).argv;
