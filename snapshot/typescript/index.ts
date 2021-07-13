/*
 * Copyright 2021 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createClient, setLogLevel, FluenceClient } from "@fluencelabs/fluence";
import { krasnodar, Node } from "@fluencelabs/fluence-network-environment";
// import { ethers } from "ethers";
import { ts_getter } from "./timestamp_getter";

// simple timestamp diff calculator and counter
function timestamp_delta(proposal_ts_ms: number, network_ts_ms: number[]): Map<string, Array<number>> {

    // acceptable deviation for proposed timestamp from network timestamps
    const acceptable_ts_diff: number = 60 * 1_000; // 1 Minute

    // valid and invalid array counters
    let valid_ts: Array<number> = [];
    let invalid_ts: Array<number> = [];

    // if proposed timestamp <= network timestamp + acceptable delta 
    // we have a valid proposed timestamp
    for (var t of network_ts_ms) {
        let upper_threshold: number = t + acceptable_ts_diff;
        let lower_threshold: number = t - acceptable_ts_diff;
        // console.log(t, threshold_ts);

        if (lower_threshold <= proposal_ts_ms && proposal_ts_ms <= upper_threshold) {
            valid_ts.push(t);
        }
        else {
            invalid_ts.push(t);
        }

    }

    // return results as a map for further, e..g, consensus, processing
    let results = new Map<string, Array<number>>();
    results.set("valid", valid_ts);
    results.set("invalid", invalid_ts);
    return results;
}

async function main() {
    // setLogLevel('DEBUG');
    const fluence = await createClient(krasnodar[2]);
    // console.log("created a fluence client %s with relay %s", fluence.selfPeerId, fluence.relayPeerId);


    // Proxy for timestamp extracted from EIP712 proposal
    var now = new Date;
    var utc_ts = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    console.log("proxy for EIP712 proposed timestamp (utc): ", utc_ts);


    // fetch timestamps from Krsnodar network with ts_getter 
    // see timestamp_getter.ts which was created by compiling ./aqua-scripts/timestamp_getter.aqua
    const network_result = await ts_getter(fluence, krasnodar[2].peerId, Number(20));

    // calculate the deltas between network timestamps + delta and proposed timestamp  
    const ts_diffs = timestamp_delta(utc_ts, network_result);

    // exceedingly simple consensus calculator
    // if 2/3 of ts deltas are valid, we have consensus for a valid proposed timestamp
    if (ts_diffs.has("valid") && ts_diffs.has("invalid")) {
        let valid_ts = ts_diffs.get("valid")?.length;
        let invalid_ts = ts_diffs.get("invalid")?.length;

        if (valid_ts !== undefined && invalid_ts !== undefined && (valid_ts / (valid_ts + invalid_ts)) >= (2 / 3)) {
            console.log("We have network consensus and accept the proposed timestamp ", utc_ts);
            console.log("Now, the client can sign the EIP712 document.");
        }
        else {
            console.log("We do not have network consensus and reject the proposed timestamp ", utc_ts);
        }
    }
    else {
        console.log("Error: Something went wrong with getting our timestamp validated.");
    }

    return;
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

