"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vale3_1 = tslib_1.__importDefault(require("./vale3"));
const Discord = tslib_1.__importStar(require("discord.js"));
const fs = tslib_1.__importStar(require("fs-extra"));
const path = tslib_1.__importStar(require("path"));
const events_1 = require("events");
const os_1 = require("os");
const util_1 = require("util");
const https_1 = require("https");
exports.chalk = require("chalk");
try {
    exports.stripAnsi = require("strip-ansi");
}
catch (opt) {
    exports.stripAnsi = (c) => c;
}
/**
 * VAL-1: TO BE USED BOTH WITH USER AND BOTS ACCOUNTS
 * VAL-2: RELOAD ONLY MODIFIED MODULES/COMMANDS!
 */
var Classes;
(function (Classes) {
    let Errors;
    (function (Errors) {
        Errors.EBADSZ = new RangeError("Bad Size.");
    })(Errors = Classes.Errors || (Classes.Errors = {})); //Errors
    class Vale extends events_1.EventEmitter {
        constructor(opts = Vale.defaultOpts) {
            super();
            this.commands = new Map();
            let nopts = {};
            Object.assign(nopts, Vale.defaultOpts);
            Object.assign(nopts, opts);
            this.opts = nopts;
            this.client = new Discord.Client(opts.config.client);
        } //ctor
        //@Override
        on(event, listener) {
            return super.on(event, listener);
        } //on
        start() {
            vale3_1.default.setup(this);
            this.client.login(this.opts.token); //!destroy()
            return this;
        } //start
        async command(message) {
            try {
                let found = Array.from(this.commands.values()).find((cmd) => cmd.exp.test(message.content));
                if (found) {
                    //@ts-ignore
                    this._debug(exports.chalk.keyword("orange").dim(message.author.tag + " (" + message.channel.name + "  -  [ " + (message.guild || { name: "undefined" }).name + " ] )") + ":", exports.chalk.yellow(message.content), "---", exports.chalk.grey.dim(Date()));
                    return await found.body(message, this);
                }
            }
            catch (err) {
                return this._debug(exports.chalk.red(util_1.inspect(err)));
            }
        } //command
        _debug(...msg) {
            let prec;
            this._debuglog += (prec = msg.join(' ')) + " --- " + Date() + os_1.EOL;
            this.emit("log", prec);
            this.emit("rawlog", exports.stripAnsi(prec));
            if (this._panel && this._panel.sock)
                this._panel.sock.of("/admin").to("admin").send(exports.stripAnsi(prec));
            return prec;
        } //_debug
        async _loadCMD(from = "dist/lib/commands/") {
            let stats = await fs.stat(from);
            if (stats.isDirectory()) {
                let files = await fs.readdir(from);
                for (let file of files) {
                    let comm, full;
                    try {
                        delete require.cache[require.resolve(full = path.resolve(path.join(from, file)))];
                        comm = require(full);
                        await comm.init(this);
                    }
                    catch (err) {
                        this._debug(exports.chalk.red(util_1.inspect(err)));
                        continue;
                    }
                    this.commands.set(comm.command.name, comm.command);
                }
                this._debug(exports.chalk.cyan.dim("Loaded bot commands"), exports.chalk.grey.dim(" ---  " + Date()));
            }
            else {
                let comm, full;
                try {
                    delete require.cache[require.resolve(full = path.resolve(from))];
                    comm = require(full);
                    await comm.init(this);
                }
                catch (err) {
                    this._debug(exports.chalk.red(util_1.inspect(err)));
                    return this;
                }
                this.commands.set(comm.command.name, comm.command);
                this._debug(exports.chalk.cyan.dim("Loaded bot command: " + from), exports.chalk.grey.dim(" ---  " + Date()));
            }
            return this;
        } //_loadCMD
    } //Vale
    Vale.defaultOpts = {
        token: '',
        config: {
            prefix: '!',
            cust: "cust.config.json",
            client: {
                messageCacheLifetime: 1800,
                disableEveryone: true
            }
        },
        custconfig: {}
    };
    Classes.Vale = Vale;
    class Command {
        constructor(opts) {
            this.desc = '';
            this.usage = '';
            this.category = '';
            this.data = {};
            Object.assign(this, opts);
        } //ctor
        //@Override
        async body(message, vale) {
            //can support non-message commanding?
        } //body
        //@Override
        async _remove(vale) {
            //cleanup(?)
        } //_remove
    } //Command
    Classes.Command = Command;
    class CacheBank {
        constructor(name, size = 50, autopurge = true, reusables = true) {
            this.size = 50;
            this.cache = [];
            this.name = "CacheBank-" + CacheBank.cntr++;
            this.autopurge = false;
            this.reusables = false;
            this.name = name || this.name;
            this.size = size || this.size;
            this.autopurge = autopurge || this.autopurge;
            this.reusables = reusables || this.reusables;
        } //ctor
        get(item) {
            if (this.cache.length === 0)
                throw Errors.EBADSZ;
            if (item === undefined || item === null) {
                let idx = Math.round(Math.random() * (this.cache.length - 1)), tmp = this.cache[idx];
                if (this.reusables === false)
                    this.cache.splice(idx, 1);
                return tmp.entry;
            }
            else {
                let tmp = this.cache[item];
                if (this.reusables === false)
                    this.cache.splice(item, 1);
                return tmp.entry;
            }
        } //random
        purge(items = 1) {
            let out = [];
            this._arrange();
            while (items--) {
                out.push(this.cache.shift());
            }
            return out;
        } //purge
        push(item) {
            if (this.autopurge && this.cache.length === this.size - 1)
                this.purge();
            return this.cache.push({
                entry: item,
                timestamp: Date.now()
            });
        } //push
        _arrange() {
            return this.cache = this.cache.sort((a, b) => a.timestamp - b.timestamp);
        } //_arrange
    } //CacheBank
    CacheBank.cntr = 0;
    Classes.CacheBank = CacheBank;
    async function fetch(url) {
        return new Promise((res, rej) => {
            https_1.get(url, (resp) => {
                let reply = '';
                resp.on("data", (chunk) => {
                    reply += chunk;
                });
                resp.once("close", () => res(decodeURIComponent(reply)));
            }).once("error", rej);
        });
    } //fetch
    Classes.fetch = fetch;
    async function failsafe(...params) {
        try {
            return await this.reply(...params);
        }
        catch (err) {
            return await this.author.send(...params);
        }
    } //failsafe
    Classes.failsafe = failsafe;
})(Classes = exports.Classes || (exports.Classes = {})); //Classes
exports.default = Classes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xhc3Nlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9DbGFzc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsNERBQTRCO0FBQzVCLDREQUFzQztBQUV0QyxxREFBK0I7QUFDL0IsbURBQTZCO0FBQzdCLG1DQUFzQztBQUN0QywyQkFBeUI7QUFDekIsK0JBQStCO0FBQy9CLGlDQUE0QztBQUcvQixRQUFBLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFLdEMsSUFBSTtJQUNILGlCQUFTLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0NBQ2xDO0FBQUMsT0FBTyxHQUFHLEVBQUU7SUFDYixpQkFBUyxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDMUI7QUFHRDs7O0dBR0c7QUFHSCxJQUFjLE9BQU8sQ0ErUnBCO0FBL1JELFdBQWMsT0FBTztJQWtEcEIsSUFBaUIsTUFBTSxDQUl0QjtJQUpELFdBQWlCLE1BQU07UUFFVCxhQUFNLEdBQWUsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFL0QsQ0FBQyxFQUpnQixNQUFNLEdBQU4sY0FBTSxLQUFOLGNBQU0sUUFJdEIsQ0FBQyxRQUFRO0lBU1YsTUFBYSxJQUFLLFNBQVEscUJBQVk7UUFzQnJDLFlBQW1CLE9BQXlCLElBQUksQ0FBQyxXQUFXO1lBQzNELEtBQUssRUFBRSxDQUFDO1lBaEJULGFBQVEsR0FBeUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQWtCMUMsSUFBSSxLQUFLLEdBQXVDLEVBQUcsQ0FBQztZQUNwRCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7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LElBQUk7WUFDSCxPQUFPLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1NBQ25DO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDYixPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztTQUN6QztJQUNGLENBQUMsQ0FBQyxVQUFVO0lBTlUsZ0JBQVEsV0FNN0IsQ0FBQTtBQUVGLENBQUMsRUEvUmEsT0FBTyxHQUFQLGVBQU8sS0FBUCxlQUFPLFFBK1JwQixDQUFDLFNBQVM7QUFFWCxrQkFBZSxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBWYWxlMyBmcm9tIFwiLi92YWxlM1wiO1xyXG5pbXBvcnQgKiBhcyBEaXNjb3JkIGZyb20gXCJkaXNjb3JkLmpzXCI7XHJcbmltcG9ydCAqIGFzIGFkbV9wYW5lbCBmcm9tIFwiYWRtLXBhbmVsMlwiO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tIFwiZXZlbnRzXCI7XHJcbmltcG9ydCB7IEVPTCB9IGZyb20gXCJvc1wiO1xyXG5pbXBvcnQgeyBpbnNwZWN0IH0gZnJvbSBcInV0aWxcIjtcclxuaW1wb3J0IHsgZ2V0LCBSZXF1ZXN0T3B0aW9ucyB9IGZyb20gXCJodHRwc1wiO1xyXG5pbXBvcnQgeyBVUkwgfSBmcm9tIFwidXJsXCI7XHJcbmltcG9ydCB7IEluY29taW5nTWVzc2FnZSB9IGZyb20gXCJodHRwXCI7XHJcbmV4cG9ydCBjb25zdCBjaGFsayA9IHJlcXVpcmUoXCJjaGFsa1wiKTtcclxuZXhwb3J0IHZhciBzdHJpcEFuc2k6IHtcclxuXHQoYzogYW55KTogYW55O1xyXG59O1xyXG5cclxudHJ5IHtcclxuXHRzdHJpcEFuc2kgPSByZXF1aXJlKFwic3RyaXAtYW5zaVwiKTtcclxufSBjYXRjaCAob3B0KSB7XHJcblx0c3RyaXBBbnNpID0gKGM6IGFueSkgPT4gYztcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBWQUwtMTogVE8gQkUgVVNFRCBCT1RIIFdJVEggVVNFUiBBTkQgQk9UUyBBQ0NPVU5UU1xyXG4gKiBWQUwtMjogUkVMT0FEIE9OTFkgTU9ESUZJRUQgTU9EVUxFUy9DT01NQU5EUyFcclxuICovXHJcblxyXG5cclxuZXhwb3J0IG1vZHVsZSBDbGFzc2VzIHtcclxuXHJcblx0ZXhwb3J0IG5hbWVzcGFjZSBPcHRpb25zIHtcclxuXHJcblx0XHRleHBvcnQgaW50ZXJmYWNlIFZhbGVPcHRzIHtcclxuXHJcblx0XHRcdHJlYWRvbmx5IHRva2VuOiBzdHJpbmc7XHJcblx0XHRcdGNvbmZpZzoge1xyXG5cdFx0XHRcdGN1c3Q/OiBzdHJpbmcgfCBudW1iZXIgfCBCdWZmZXI7XHJcblx0XHRcdFx0cHJlZml4OiBzdHJpbmc7XHJcblx0XHRcdFx0Y2xpZW50PzogRGlzY29yZC5DbGllbnRPcHRpb25zO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRjdXN0Y29uZmlnPzoge1xyXG5cdFx0XHRcdHBhbmVsPzogYW55O1xyXG5cdFx0XHRcdHdob29rPzogYW55O1xyXG5cdFx0XHRcdFtpZHg6IHN0cmluZ106IGFueTtcclxuXHRcdFx0fTtcclxuXHJcblx0XHR9IC8vVmFsZU9wdHNcclxuXHJcblx0XHRleHBvcnQgaW50ZXJmYWNlIENvbW1hbmRPcHRzIHtcclxuXHJcblx0XHRcdG5hbWU6IHN0cmluZztcclxuXHRcdFx0ZXhwOiBSZWdFeHA7XHJcblx0XHRcdGRlc2M/OiBzdHJpbmc7XHJcblx0XHRcdHVzYWdlPzogc3RyaW5nO1xyXG5cdFx0XHQvKiogVXRpbGl0eSwgT3duZXIsIEFkbWluXHJcblx0XHRcdCAqIEB0eXBlIHtzdHJpbmd9XHJcblx0XHRcdCAqIEBtZW1iZXJvZiBDb21tYW5kT3B0c1xyXG5cdFx0XHQgKi9cclxuXHRcdFx0Y2F0ZWdvcnk/OiBzdHJpbmc7XHJcblx0XHRcdGRhdGE/OiBhbnk7XHJcblx0XHRcdGJvZHk6IChtZXNzYWdlOiBEaXNjb3JkLk1lc3NhZ2UsIHZhbGU6IFZhbGUpID0+IFByb21pc2U8YW55PjtcclxuXHRcdFx0X3JlbW92ZT86ICh2YWxlPzogVmFsZSkgPT4gUHJvbWlzZTxhbnk+O1xyXG5cclxuXHRcdH0gLy9Db21tYW5kT3B0c1xyXG5cclxuXHRcdGV4cG9ydCBpbnRlcmZhY2UgQ2FjaGVCYW5rT3B0cyB7XHJcblxyXG5cdFx0XHRzaXplOiBudW1iZXI7XHJcblx0XHRcdGNhY2hlOiBDYWNoZUVudHJ5W107XHJcblx0XHRcdG5hbWU/OiBzdHJpbmc7XHJcblx0XHRcdGF1dG9wdXJnZT86IGJvb2xlYW47XHJcblx0XHRcdHJldXNhYmxlcz86IGJvb2xlYW47XHJcblxyXG5cdFx0fSAvL0NhY2hlQmFua09wdHNcclxuXHJcblx0fSAvL09wdGlvbnNcclxuXHJcblxyXG5cdGV4cG9ydCBuYW1lc3BhY2UgRXJyb3JzIHtcclxuXHJcblx0XHRleHBvcnQgY29uc3QgRUJBRFNaOiBSYW5nZUVycm9yID0gbmV3IFJhbmdlRXJyb3IoXCJCYWQgU2l6ZS5cIik7XHJcblxyXG5cdH0gLy9FcnJvcnNcclxuXHJcblxyXG5cdGV4cG9ydCB0eXBlIENhY2hlRW50cnkgPSB7XHJcblx0XHR0aW1lc3RhbXA6IG51bWJlcjtcclxuXHRcdGVudHJ5OiBhbnlcclxuXHR9O1xyXG5cclxuXHJcblx0ZXhwb3J0IGNsYXNzIFZhbGUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cclxuXHRcdHJlYWRvbmx5IG9wdHM6IE9wdGlvbnMuVmFsZU9wdHM7XHJcblx0XHRyZWFkb25seSBjbGllbnQ6IERpc2NvcmQuQ2xpZW50O1xyXG5cdFx0d2hvb2s6IERpc2NvcmQuV2ViaG9vaztcclxuXHRcdF9kZWJ1Z2xvZzogc3RyaW5nO1xyXG5cdFx0X3BhbmVsOiBhZG1fcGFuZWwuQ2xhc3Nlcy5QYW5lbDtcclxuXHRcdGNvbW1hbmRzOiBNYXA8c3RyaW5nLCBDb21tYW5kPiA9IG5ldyBNYXAoKTtcclxuXHJcblx0XHRwdWJsaWMgc3RhdGljIGRlZmF1bHRPcHRzOiBPcHRpb25zLlZhbGVPcHRzID0ge1xyXG5cdFx0XHR0b2tlbjogJycsXHJcblx0XHRcdGNvbmZpZzoge1xyXG5cdFx0XHRcdHByZWZpeDogJyEnLFxyXG5cdFx0XHRcdGN1c3Q6IFwiY3VzdC5jb25maWcuanNvblwiLFxyXG5cdFx0XHRcdGNsaWVudDoge1xyXG5cdFx0XHRcdFx0bWVzc2FnZUNhY2hlTGlmZXRpbWU6IDE4MDAsXHJcblx0XHRcdFx0XHRkaXNhYmxlRXZlcnlvbmU6IHRydWVcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdGN1c3Rjb25maWc6IHsgfVxyXG5cdFx0fTtcclxuXHJcblx0XHRwdWJsaWMgY29uc3RydWN0b3Iob3B0czogT3B0aW9ucy5WYWxlT3B0cyA9IFZhbGUuZGVmYXVsdE9wdHMpIHtcclxuXHRcdFx0c3VwZXIoKTtcclxuXHJcblx0XHRcdGxldCBub3B0czogT3B0aW9ucy5WYWxlT3B0cyA9IDxPcHRpb25zLlZhbGVPcHRzPnsgfTtcclxuXHRcdFx0T2JqZWN0LmFzc2lnbihub3B0cywgVmFsZS5kZWZhdWx0T3B0cyk7XHJcblx0XHRcdE9iamVjdC5hc3NpZ24obm9wdHMsIG9wdHMpO1xyXG5cdFx0XHR0aGlzLm9wdHMgPSBub3B0cztcclxuXHJcblx0XHRcdHRoaXMuY2xpZW50ID0gbmV3IERpc2NvcmQuQ2xpZW50KG9wdHMuY29uZmlnLmNsaWVudCk7XHJcblx0XHR9IC8vY3RvclxyXG5cclxuXHRcdHB1YmxpYyBvbihldmVudDogXCJsb2dcIiwgbGlzdGVuZXI6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IHRoaXM7XHJcblx0XHRwdWJsaWMgb24oZXZlbnQ6IFwicmF3bG9nXCIsIGxpc3RlbmVyOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiB0aGlzO1xyXG5cclxuXHRcdC8vQE92ZXJyaWRlXHJcblx0XHRwdWJsaWMgb24oZXZlbnQ6IHN0cmluZyB8IHN5bWJvbCwgbGlzdGVuZXI6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IHRoaXMge1xyXG5cdFx0XHRyZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcclxuXHRcdH0gLy9vblxyXG5cclxuXHRcdHB1YmxpYyBzdGFydCgpIHtcclxuXHRcdFx0VmFsZTMuc2V0dXAodGhpcyk7XHJcblx0XHRcdHRoaXMuY2xpZW50LmxvZ2luKHRoaXMub3B0cy50b2tlbik7ICAvLyFkZXN0cm95KClcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9IC8vc3RhcnRcclxuXHJcblx0XHRwdWJsaWMgYXN5bmMgY29tbWFuZChtZXNzYWdlOiBEaXNjb3JkLk1lc3NhZ2UpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRsZXQgZm91bmQgPSBBcnJheS5mcm9tKHRoaXMuY29tbWFuZHMudmFsdWVzKCkpLmZpbmQoKGNtZDogQ29tbWFuZCkgPT4gY21kLmV4cC50ZXN0KG1lc3NhZ2UuY29udGVudCkpO1xyXG5cclxuXHRcdFx0XHRpZiAoZm91bmQpIHtcclxuXHRcdFx0XHRcdC8vQHRzLWlnbm9yZVxyXG5cdFx0XHRcdFx0dGhpcy5fZGVidWcoY2hhbGsua2V5d29yZChcIm9yYW5nZVwiKS5kaW0obWVzc2FnZS5hdXRob3IudGFnICsgXCIgKFwiICsgbWVzc2FnZS5jaGFubmVsLm5hbWUgKyBcIiAgLSAgWyBcIiArIChtZXNzYWdlLmd1aWxkIHx8IHsgbmFtZTogXCJ1bmRlZmluZWRcIiB9KS5uYW1lICsgXCIgXSApXCIpICsgXCI6XCIsIGNoYWxrLnllbGxvdyhtZXNzYWdlLmNvbnRlbnQpLCBcIi0tLVwiLCBjaGFsay5ncmV5LmRpbShEYXRlKCkpKTtcclxuXHRcdFx0XHRcdHJldHVybiBhd2FpdCBmb3VuZC5ib2R5KG1lc3NhZ2UsIHRoaXMpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2RlYnVnKGNoYWxrLnJlZChpbnNwZWN0KGVycikpKTtcclxuXHRcdFx0fVxyXG5cdFx0fSAvL2NvbW1hbmRcclxuXHJcblx0XHRfZGVidWcoLi4ubXNnOiBhbnkpIHtcclxuXHRcdFx0bGV0IHByZWM6IHN0cmluZztcclxuXHRcdFx0dGhpcy5fZGVidWdsb2cgKz0gKHByZWMgPSBtc2cuam9pbignICcpKSArIFwiIC0tLSBcIiArIERhdGUoKSArIEVPTDtcclxuXHRcdFx0dGhpcy5lbWl0KFwibG9nXCIsIHByZWMpO1xyXG5cdFx0XHR0aGlzLmVtaXQoXCJyYXdsb2dcIiwgc3RyaXBBbnNpKHByZWMpKTtcclxuXHRcdFx0aWYgKHRoaXMuX3BhbmVsICYmIHRoaXMuX3BhbmVsLnNvY2spdGhpcy5fcGFuZWwuc29jay5vZihcIi9hZG1pblwiKS50byhcImFkbWluXCIpLnNlbmQoc3RyaXBBbnNpKHByZWMpKTtcclxuXHRcdFx0cmV0dXJuIHByZWM7XHJcblx0XHR9IC8vX2RlYnVnXHJcblxyXG5cdFx0YXN5bmMgX2xvYWRDTUQoZnJvbTogc3RyaW5nID0gXCJkaXN0L2xpYi9jb21tYW5kcy9cIikge1xyXG5cdFx0XHRsZXQgc3RhdHMgPSBhd2FpdCBmcy5zdGF0KGZyb20pO1xyXG5cclxuXHRcdFx0aWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcclxuXHRcdFx0XHRsZXQgZmlsZXMgPSBhd2FpdCBmcy5yZWFkZGlyKGZyb20pO1xyXG5cclxuXHRcdFx0XHRmb3IgKGxldCBmaWxlIG9mIGZpbGVzKSB7XHJcblx0XHRcdFx0XHRsZXQgY29tbTogYW55LFxyXG5cdFx0XHRcdFx0XHRmdWxsOiBzdHJpbmc7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoZnVsbCA9IHBhdGgucmVzb2x2ZShwYXRoLmpvaW4oZnJvbSwgZmlsZSkpKV07XHJcblx0XHRcdFx0XHRcdGNvbW0gPSByZXF1aXJlKGZ1bGwpO1xyXG5cdFx0XHRcdFx0XHRhd2FpdCBjb21tLmluaXQodGhpcyk7XHJcblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fZGVidWcoY2hhbGsucmVkKGluc3BlY3QoZXJyKSkpO1xyXG5cdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR0aGlzLmNvbW1hbmRzLnNldChjb21tLmNvbW1hbmQubmFtZSwgY29tbS5jb21tYW5kKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRoaXMuX2RlYnVnKGNoYWxrLmN5YW4uZGltKFwiTG9hZGVkIGJvdCBjb21tYW5kc1wiKSwgY2hhbGsuZ3JleS5kaW0oXCIgLS0tICBcIiArIERhdGUoKSkpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxldCBjb21tOiBhbnksXHJcblx0XHRcdFx0XHRmdWxsOiBzdHJpbmc7XHJcblxyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoZnVsbCA9IHBhdGgucmVzb2x2ZShmcm9tKSldO1xyXG5cdFx0XHRcdFx0Y29tbSA9IHJlcXVpcmUoZnVsbCk7XHJcblx0XHRcdFx0XHRhd2FpdCBjb21tLmluaXQodGhpcyk7XHJcblx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0XHR0aGlzLl9kZWJ1ZyhjaGFsay5yZWQoaW5zcGVjdChlcnIpKSk7XHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHRoaXMuY29tbWFuZHMuc2V0KGNvbW0uY29tbWFuZC5uYW1lLCBjb21tLmNvbW1hbmQpO1xyXG5cdFx0XHRcdHRoaXMuX2RlYnVnKGNoYWxrLmN5YW4uZGltKFwiTG9hZGVkIGJvdCBjb21tYW5kOiBcIiArIGZyb20pLCBjaGFsay5ncmV5LmRpbShcIiAtLS0gIFwiICsgRGF0ZSgpKSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSAvL19sb2FkQ01EXHJcblxyXG5cdH0gLy9WYWxlXHJcblxyXG5cdGV4cG9ydCBjbGFzcyBDb21tYW5kIGltcGxlbWVudHMgT3B0aW9ucy5Db21tYW5kT3B0cyB7XHJcblxyXG5cdFx0cHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcclxuXHRcdHB1YmxpYyBleHA6IFJlZ0V4cDtcclxuXHRcdHB1YmxpYyBkZXNjPzogc3RyaW5nID0gJyc7XHJcblx0XHRwdWJsaWMgdXNhZ2U/OiBzdHJpbmcgPSAnJztcclxuXHRcdHB1YmxpYyBjYXRlZ29yeT86IHN0cmluZyA9ICcnO1xyXG5cdFx0cHVibGljIGRhdGE/OiBhbnkgPSB7IH07XHJcblx0XHRcclxuXHRcdHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRzOiBPcHRpb25zLkNvbW1hbmRPcHRzKSB7XHJcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcywgb3B0cyk7XHJcblx0XHR9IC8vY3RvclxyXG5cclxuXHRcdC8vQE92ZXJyaWRlXHJcblx0XHRwdWJsaWMgYXN5bmMgYm9keShtZXNzYWdlPzogRGlzY29yZC5NZXNzYWdlLCB2YWxlPzogVmFsZSkge1xyXG5cdFx0XHQvL2NhbiBzdXBwb3J0IG5vbi1tZXNzYWdlIGNvbW1hbmRpbmc/XHJcblx0XHR9IC8vYm9keVxyXG5cclxuXHRcdC8vQE92ZXJyaWRlXHJcblx0XHRhc3luYyBfcmVtb3ZlKHZhbGU/OiBWYWxlKSB7XHJcblx0XHRcdC8vY2xlYW51cCg/KVxyXG5cdFx0fSAvL19yZW1vdmVcclxuXHJcblx0fSAvL0NvbW1hbmRcclxuXHJcblx0ZXhwb3J0IGNsYXNzIENhY2hlQmFuayBpbXBsZW1lbnRzIE9wdGlvbnMuQ2FjaGVCYW5rT3B0cyB7XHJcblxyXG5cdFx0cHVibGljIHNpemU6IG51bWJlciA9IDUwO1xyXG5cdFx0Y2FjaGU6IENhY2hlRW50cnlbXSA9IFsgXTtcclxuXHRcdHB1YmxpYyBuYW1lOiBzdHJpbmcgPSBcIkNhY2hlQmFuay1cIiArIENhY2hlQmFuay5jbnRyKys7XHJcblx0XHRwdWJsaWMgYXV0b3B1cmdlOiBib29sZWFuID0gZmFsc2U7XHJcblx0XHRwdWJsaWMgcmV1c2FibGVzOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG5cdFx0cHJpdmF0ZSBzdGF0aWMgY250cjogbnVtYmVyID0gMDtcclxuXHJcblx0XHRwdWJsaWMgY29uc3RydWN0b3IobmFtZT86IHN0cmluZywgc2l6ZTogbnVtYmVyID0gNTAsIGF1dG9wdXJnZTogYm9vbGVhbiA9IHRydWUsIHJldXNhYmxlczogYm9vbGVhbiA9IHRydWUpIHtcclxuXHRcdFx0dGhpcy5uYW1lID0gbmFtZSB8fCB0aGlzLm5hbWU7XHJcblx0XHRcdHRoaXMuc2l6ZSA9IHNpemUgfHwgdGhpcy5zaXplO1xyXG5cdFx0XHR0aGlzLmF1dG9wdXJnZSA9IGF1dG9wdXJnZSB8fCB0aGlzLmF1dG9wdXJnZTtcclxuXHRcdFx0dGhpcy5yZXVzYWJsZXMgPSByZXVzYWJsZXMgfHwgdGhpcy5yZXVzYWJsZXM7XHJcblx0XHR9IC8vY3RvclxyXG5cclxuXHRcdHB1YmxpYyBnZXQoaXRlbTogbnVtYmVyKTogYW55IHtcclxuXHRcdFx0aWYgKHRoaXMuY2FjaGUubGVuZ3RoID09PSAwKSB0aHJvdyBFcnJvcnMuRUJBRFNaO1xyXG5cclxuXHRcdFx0aWYgKGl0ZW0gPT09IHVuZGVmaW5lZCB8fCBpdGVtID09PSBudWxsKSB7XHJcblx0XHRcdFx0bGV0IGlkeDogbnVtYmVyID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKHRoaXMuY2FjaGUubGVuZ3RoIC0gMSkpLFxyXG5cdFx0XHRcdFx0dG1wOiBDYWNoZUVudHJ5ID0gdGhpcy5jYWNoZVtpZHhdO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmICh0aGlzLnJldXNhYmxlcyA9PT0gZmFsc2UpIHRoaXMuY2FjaGUuc3BsaWNlKGlkeCwgMSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIHRtcC5lbnRyeTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsZXQgdG1wOiBDYWNoZUVudHJ5ID0gdGhpcy5jYWNoZVtpdGVtXTtcclxuXHJcblx0XHRcdFx0aWYgKHRoaXMucmV1c2FibGVzID09PSBmYWxzZSkgdGhpcy5jYWNoZS5zcGxpY2UoaXRlbSwgMSk7XHJcblxyXG5cdFx0XHRcdHJldHVybiB0bXAuZW50cnk7XHJcblx0XHRcdH1cclxuXHRcdH0gLy9yYW5kb21cclxuXHJcblx0XHRwdXJnZShpdGVtczogbnVtYmVyID0gMSk6IENhY2hlRW50cnlbXSB7XHJcblx0XHRcdGxldCBvdXQ6IENhY2hlRW50cnlbXSA9IFsgXTtcclxuXHJcblx0XHRcdHRoaXMuX2FycmFuZ2UoKTtcclxuXHJcblx0XHRcdHdoaWxlIChpdGVtcy0tKSB7XHJcblx0XHRcdFx0b3V0LnB1c2godGhpcy5jYWNoZS5zaGlmdCgpKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG91dDtcclxuXHRcdH0gLy9wdXJnZVxyXG5cclxuXHRcdHB1YmxpYyBwdXNoKGl0ZW06IGFueSk6IG51bWJlciB7XHJcblx0XHRcdGlmICh0aGlzLmF1dG9wdXJnZSAmJiB0aGlzLmNhY2hlLmxlbmd0aCA9PT0gdGhpcy5zaXplIC0gMSkgdGhpcy5wdXJnZSgpO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2FjaGUucHVzaCh7XHJcblx0XHRcdFx0ZW50cnk6IGl0ZW0sXHJcblx0XHRcdFx0dGltZXN0YW1wOiBEYXRlLm5vdygpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSAvL3B1c2hcclxuXHJcblx0XHRfYXJyYW5nZSgpOiBDYWNoZUVudHJ5W10ge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jYWNoZSA9IHRoaXMuY2FjaGUuc29ydCgoYTogQ2FjaGVFbnRyeSwgYjogQ2FjaGVFbnRyeSkgPT4gYS50aW1lc3RhbXAgLSBiLnRpbWVzdGFtcCk7XHJcblx0XHR9IC8vX2FycmFuZ2VcclxuXHJcblx0fSAvL0NhY2hlQmFua1xyXG5cclxuXHRleHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2godXJsOiBzdHJpbmcgfCBSZXF1ZXN0T3B0aW9ucyB8IFVSTCk6IFByb21pc2U8c3RyaW5nPiB7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlczogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQsIHJlaik6IHZvaWQgPT4ge1xyXG5cdFx0XHRnZXQodXJsLCAocmVzcDogSW5jb21pbmdNZXNzYWdlKTogdm9pZCA9PiB7XHJcblx0XHRcdFx0bGV0IHJlcGx5OiBzdHJpbmcgPSAnJztcclxuXHJcblx0XHRcdFx0cmVzcC5vbihcImRhdGFcIiwgKGNodW5rOiBCdWZmZXIpOiB2b2lkID0+IHtcclxuXHRcdFx0XHRcdHJlcGx5ICs9IGNodW5rO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHJlc3Aub25jZShcImNsb3NlXCIsICgpID0+IHJlcyhkZWNvZGVVUklDb21wb25lbnQocmVwbHkpKSk7XHJcblx0XHRcdH0pLm9uY2UoXCJlcnJvclwiLCByZWopO1xyXG5cdFx0fSk7XHJcblx0fSAvL2ZldGNoXHJcblxyXG5cdGV4cG9ydCBhc3luYyBmdW5jdGlvbiBmYWlsc2FmZSh0aGlzOiBEaXNjb3JkLk1lc3NhZ2UsIC4uLnBhcmFtczogYW55W10pOiBQcm9taXNlPERpc2NvcmQuTWVzc2FnZSB8IERpc2NvcmQuTWVzc2FnZVtdPiB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5yZXBseSguLi5wYXJhbXMpO1xyXG5cdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmF1dGhvci5zZW5kKC4uLnBhcmFtcyk7XHJcblx0XHR9XHJcblx0fSAvL2ZhaWxzYWZlXHJcblxyXG59IC8vQ2xhc3Nlc1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2xhc3NlcztcclxuIl19