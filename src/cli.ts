#!/usr/bin/env node

import { tendr } from './tendr';

tendr(process.argv.slice(2)).argv;
