// EOS intrinsics
export declare function read_action_data( buffer: usize , len: u32 ) : u32;
export declare function action_data_size() : u32;
export declare function printhex( data: usize, datalen: u32 ) : void;
export declare function printi(val : u64) : void;
export declare function prints_l(cstr : usize, len: u32) : void;
export declare function prints(cstr : usize) : void;
export declare function printn(name : u64) : void;
export declare function eosio_assert(condition : u32, cstr: u32) : void;
export declare function require_auth(user : u64) : void;
export declare function require_recipient(user : u64) : void;
export declare function db_find_i64(code: u64, scope:u64, table:u64, id:u64) : i32;
export declare function db_remove_i64(iterator : i32) : void;
export declare function db_store_i64(scope : u64, table : u64, payer: u64, id : u64,  data : u32, len : u32) : i32;
export declare function db_lowerbound_i64(code: u64, scope:u64, table:u64, id:u64) : i32;
export declare function db_next_i64(iterator : i32, primary: i32) : i32;
export declare function db_previous_i64(iterator : i32, primary: i32) : i32;
export declare function db_get_i64(iterator : i32, data : u32, len : u32) : i32;
export declare function db_update_i64(iterator : i32, payer : u64, data : u32, len : u32) : void;
export declare function db_end_i64(code : u64, scope : u64, table : u64) : i32;
export declare function current_time() : u64;
export declare function send_inline(action : usize, len : i32) : void;