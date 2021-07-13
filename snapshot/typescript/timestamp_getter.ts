/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/. 
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 * Aqua version: 0.1.8-161
 *
 */
import { FluenceClient, PeerIdB58 } from '@fluencelabs/fluence';
import { RequestFlowBuilder } from '@fluencelabs/fluence/dist/api.unstable';
import { RequestFlow } from '@fluencelabs/fluence/dist/internal/RequestFlow';



export async function ts_getter(client: FluenceClient, node: string, n_neighbors: number, config?: {ttl?: number}): Promise<number[]> {
    let request: RequestFlow;
    const promise = new Promise<number[]>((resolve, reject) => {
        const r = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (seq
    (seq
     (seq
      (seq
       (seq
        (call %init_peer_id% ("getDataSrv" "-relay-") [] -relay-)
        (call %init_peer_id% ("getDataSrv" "node") [] node)
       )
       (call %init_peer_id% ("getDataSrv" "n_neighbors") [] n_neighbors)
      )
      (call %init_peer_id% ("op" "identity") [n_neighbors] $nsize)
     )
     (call -relay- ("op" "noop") [])
    )
    (xor
     (seq
      (seq
       (seq
        (call node ("op" "string_to_b58") [node] k)
        (call node ("kad" "neighborhood") [k $none_bool $nsize] nodes)
       )
       (fold nodes n
        (par
         (seq
          (xor
           (call n ("peer" "timestamp_ms") [] $res)
           (null)
          )
          (call node ("op" "noop") [])
         )
         (next n)
        )
       )
      )
      (call node ("op" "identity") [$res.$.[9]!])
     )
     (seq
      (call -relay- ("op" "noop") [])
      (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 1])
     )
    )
   )
   (call -relay- ("op" "noop") [])
  )
  (xor
   (call %init_peer_id% ("callbackSrv" "response") [$res])
   (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 2])
  )
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error% 3])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', '-relay-', () => {
                    return client.relayPeerId!;
                });
                h.on('getDataSrv', 'node', () => {return node;});
h.on('getDataSrv', 'n_neighbors', () => {return n_neighbors;});
                h.onEvent('callbackSrv', 'response', (args) => {
  const [res] = args;
  resolve(res);
});

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for ts_getter');
            })
        if(config?.ttl) {
            r.withTTL(config.ttl)
        }
        request = r.build();
    });
    await client.initiateFlow(request!);
    return promise;
}
      