import 'allocator/arena';
import * as eos from '../eoslib';
import { DataStream } from '../datastream';
import { get_ds, N, string2cstr, assert, Name} from '../utils';
import { db_find_i64, printi, prints, require_auth } from '../eoslib';

class Todo {
    primary: u64;
    task: string;
    completed: bool;
    creator: u64;
    assignee: u64;
    iterator : i32;

    from_ds(ds : DataStream) : void {
        this.primary = ds.read<u64>();
        this.creator = ds.read<u64>();
        this.assignee= ds.read<u64>();
        this.completed= ds.read<bool>();
        this.task = ds.readString();
    }

    to_ds() : DataStream {
        let arr = new Uint8Array(this.task.length);
        let ds = new DataStream(changetype<usize>(arr.buffer), this.task.length);
        ds.store<u64>(this.primary);
        ds.store<u64>(this.creator);
        ds.store<u64>(this.assignee);
        ds.store<bool>(this.completed);
        ds.writeString(this.task);
        return ds;
    }

    to_string() : string {
        let creator = new Name();
        creator.value = this.creator;
        let assignee = new Name();
        assignee.value = this.assignee;
        return this.task.concat("|").concat(assignee.to_string()).concat("|").concat(creator.to_string());
    }
}

class TodoContract {
    receiver : u64;
    code : u64;
    action : u64;
    scope : u64;
    table : u64;
    primary : i32;

    constructor(receiver: u64, code: u64, action: u64) {
        this.receiver = receiver;
        this.code = code;
        this.action = action;
        this.scope = N("todo");
        this.table = N("todo");
    }

    get(key : u64) : void {
        let todo = this.getTodoByKey(key);
        eos.prints(todo.to_string().toUTF8());
    }

    add(task : string, creator : u64) : void {
        assert(task.length > 0, "Task is empty");
        eos.require_auth(creator);
        let key : u64 = 0;
        let end : i32 = eos.db_end_i64(this.code, this.scope, this.table);
        let iterator : i32 = eos.db_lowerbound_i64(this.code, this.scope, this.table, 0);
        if (iterator != end) {
            iterator = eos.db_previous_i64(end, offsetof<this>("primary"));
            let len = eos.db_get_i64(iterator, 0, 0);
            let arr = new Uint8Array(len);
            eos.db_get_i64(iterator, changetype<usize>(arr.buffer), len);
            let ds = new DataStream(changetype<usize>(arr.buffer), len);
            let last_todo = new Todo();
            last_todo.from_ds(ds);
            key = last_todo.primary + 1;
        }

        let todo = new Todo();
        todo.primary = key;
        todo.assignee = this.code;
        todo.creator = creator;
        todo.completed = false;
        todo.task = task;
        let ds_to_save = todo.to_ds();
        iterator = eos.db_store_i64(this.scope, this.table, creator, todo.primary, ds_to_save.buffer, ds_to_save.pos);
    }

    removeAll() : void {
        let iterator = eos.db_lowerbound_i64(this.code, this.scope, this.table, 0);
        let i : i32 = 0;
        while (iterator >= 0) {
            let del = iterator;
            iterator = eos.db_next_i64(iterator, changetype<usize>(this) + offsetof<this>("primary"));
            //eos.prints("\nPrimary: ".toUTF8());
            //eos.printi(this.primary);
            eos.db_remove_i64(del);
            i++;
          }
        eos.prints("Removed ".toUTF8());
        eos.printi(i);
    }

    update(key : u64, completed : bool) : void {
        let todo = this.getTodoByKey(key);        
        require_auth(todo.creator);
        todo.completed = completed;
        let ds = todo.to_ds();
        eos.db_update_i64(todo.iterator, todo.creator, changetype<usize>(ds.buffer), ds.pos);
    }

    remove(key : u64) : void {
        let todo = this.getTodoByKey(key);
        require_auth(todo.creator);
        eos.db_remove_i64(todo.iterator);
    }

    assign(key : u64, assignee : u64) : void {
        let todo = this.getTodoByKey(key);
        require_auth(todo.creator);
        todo.assignee = assignee;
        let ds = todo.to_ds();
        eos.db_update_i64(todo.iterator, todo.creator, changetype<usize>(ds.buffer), ds.pos);
    }

    private getTodoByKey(key : u64) : Todo {
        let iterator = eos.db_find_i64(this.code, this.scope, this.table, key);
        let len = eos.db_get_i64(iterator, 0, 0);
        assert(len >= 0, "invalid length");
        let arr = new Uint8Array(len);
        eos.db_get_i64(iterator, changetype<usize>(arr.buffer), len);

        let output = new DataStream(changetype<usize>(arr.buffer), len);
        let todo = new Todo();
        todo.iterator = iterator;
        todo.from_ds(output);
        return todo;
    }
}

export function apply(receiver: u64, code: u64, action: u64) : void {
    let ds = get_ds();
    let contract = new TodoContract(receiver, code, action);
    if (action == N('add')) {
       contract.add(ds.readString(), ds.read<u64>()); 
    }
    else if (action == N('get')) {
       contract.get(ds.readVarint32());
    }
    else if (action == N('update')) {
       contract.update(ds.read<u64>(), ds.read<bool>());
    }
    else if (action == N('remove')) {
       contract.remove(ds.read<u64>());
    }
    else if (action == N('removeall')) {
        contract.removeAll();
    }
    else if (action == N('assign')) {
        contract.assign(ds.read<u64>(), ds.read<u64>());
    }
    else {
        eos.prints(string2cstr("Action not found"));
    }
}