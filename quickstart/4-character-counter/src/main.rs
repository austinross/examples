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

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn non_empty_string(character_counter: marine_test_env::character_counter::ModuleInterface) {
        let actual = character_counter.hello("SuperNode".to_string());
        assert_eq!(actual.msg, "\nHello from: \nSuperNode. Character count: 23 character(s)".to_string());
    }

    #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
    fn empty_string(character_counter: marine_test_env::character_counter::ModuleInterface) {
        let actual = character_counter.hello("".to_string());
        assert_eq!(actual.msg, "\nHello from: \n. Character count: 14 character(s)");
    }
}
