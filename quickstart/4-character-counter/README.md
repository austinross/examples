# 4. Character-Counter

### Creating the WebAssembly module for char-count service

Taking the `main.rs` from `2-hosted-services` we can update it to:

```rust
// src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

module_manifest!();

pub fn main() {}

#[marine]
pub struct HelloWorld {
    pub msg: String,
    pub reply: String,
}

#[marine]
pub fn hello(from: String) -> HelloWorld {
    let msg = format!("Hello from: \n{}.", from);
    let reply = format!("Hello back to you, \n{}.", from);

    HelloWorld {
        msg: format!("\n{} Character count: {} character(s)", msg, msg.chars().count()),
        reply: format!("\n{} Character count: {} character(s)", reply, reply.chars().count()),
    }
}
```
Notice that the `msg` and `reply` will now return their respective character counts.

Run `./scripts/build.sh` to compile the code to the Wasm target from the VSCode terminal.


### Tests

We have also updated our tests found in the `main.rs` file:

```rust
#[cfg(test)]
 mod tests {
     use marine_rs_sdk_test::marine_test;
 
     #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
     fn non_empty_string(char_count: marine_test_env::char_count::ModuleInterface) {
         let actual = char_count.char_count("SuperNode ☮".to_string());
         assert_eq!(actual.msg, "Message: SuperNode ☮");
         assert_eq!(actual.reply, "Your message SuperNode ☮ has 11 character(s)".to_string());
     }
 
     #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
     fn empty_string(char_count: marine_test_env::char_count::ModuleInterface) {
         let actual = char_count.char_count("".to_string());
         assert_eq!(actual.msg, "Your message was empty");
         assert_eq!(actual.reply, "Your message has 0 characters"); 
     }
 }

```
To run the tests, use the `cargo +nightly test --release` command. 

### Deploying The Wasm Module To The Network

To get a peer from one of the Fluence testnets use `fldist`. 

```text
fldist env
```
We will use the peer `12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e`

```bash
fldist --node-id 12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e \
       new_service \
       --ms artifacts/character_counter.wasm:configs/character_counter_cfg.json \
       --name character-counter
```

Which will give us a unique service id:

```text
service id: e78c1362-44df-4f4f-9e48-052d11cc1b60
service created successfully
```

We can admire our handiwork on the Fluence Developer Hub:
https://dash.fluence.dev/blueprint/ad0cdb378d72f0dc3fa3eed9eae6f627154f66b24abe6b43904cbdb0c4eb62db


### Update Aqua code

We can update the `helloWorldNodePeerId` and `helloWorldServiceId` to the appropriate strings:

```
import "@fluencelabs/aqua-lib/builtin.aqua"

const helloWorldNodePeerId ?= "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e"
const helloWorldServiceId ?= "e78c1362-44df-4f4f-9e48-052d11cc1b60"

data HelloWorld:
  msg: string
  reply: string

-- The service runs on a Fluence node
service HelloWorld:
    hello(from: PeerId) -> HelloWorld

-- The service runs inside browser
service HelloPeer("HelloPeer"):
    hello(message: string) -> string

func sayHello(targetPeerId: PeerId, targetRelayPeerId: PeerId) -> string:
    -- execute computation on a Peer in the network
    on helloWorldNodePeerId:
        HelloWorld helloWorldServiceId
        comp <- HelloWorld.hello(%init_peer_id%)

    -- send the result to target browser in the background
    co on targetPeerId via targetRelayPeerId:
        res <- HelloPeer.hello(%init_peer_id%)

    -- send the result to the initiator
    <- comp.reply
```

### Run install
```
npm install
```

### Compile the aqua file
```
npm run compile-aqua
```

### Run the application 

```text
npm start
```

Which will open a new browser tab at http://localhost:3000 . Following the instructions, we connect to any one of the displayed relay ids, open another browser tab also at http://localhost:3000, select a relay and copy and paste the client peer id and relay id into corresponding fields in the first tab and press the say hello button.

You will now see the message and character count for the message.

![app running](https://i.imgur.com/yRylFC6.png)
