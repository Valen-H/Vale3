"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const http = tslib_1.__importStar(require("http"));
module.exports = {
    name: "auth",
    afters: [],
    befores: ["fix", "directory", "static", "end"],
    _fromFile: true,
    body: async function body(req, res, event) {
        if (!event.carriage._global.patherr) {
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-XSS-Protection", "1; mode=block");
            res.setHeader("Cache-Control", "private, no-store, max-age=3600, must-revalidate");
            res.setHeader("X-Frame-Options", "sameorigin");
            res.setHeader("Cache-Control", "max-age=120");
            res.setHeader("Vary", "User-Agent");
            if (!req.headers["authorization"]) {
                res.writeHead(401, http.STATUS_CODES[401], {
                    "WWW-Authenticate": 'Basic realm="Access to the staging site", charset="UTF-8"'
                });
                event.server._debug(event.reqcntr, "(AUTH.TS) 401");
            }
            else {
                let challenge = Buffer.from(req.headers["authorization"].split(' ')[1], "base64").toString();
                if (challenge === event.server.data["auth"]) {
                    event.server._debug(event.reqcntr, "(AUTH.TS) PASS");
                    return event.pass();
                }
                else {
                    res.writeHead(403, http.STATUS_CODES[403]);
                    event.server._debug(event.reqcntr, "(AUTH.TS) 403");
                }
            }
        }
        else {
            res.writeHead(400, http.STATUS_CODES[400], { "warning": "bad root" });
        }
        res.end("ERR");
        return event.stop();
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9taWRkbGV3YXJlcy9hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1EQUE2QjtBQUc3QixNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2hCLElBQUksRUFBRSxNQUFNO0lBQ1osTUFBTSxFQUFFLEVBQUc7SUFDWCxPQUFPLEVBQUUsQ0FBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUU7SUFDaEQsU0FBUyxFQUFFLElBQUk7SUFDZixJQUFJLEVBQUUsS0FBSyxVQUFVLElBQUksQ0FBQyxHQUF5QixFQUFFLEdBQXdCLEVBQUUsS0FBd0I7UUFDdEcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUVwQyxHQUFHLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ25ELEdBQUcsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDbkQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsa0RBQWtELENBQUMsQ0FBQztZQUNuRixHQUFHLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQy9DLEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzlDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUNsQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUMxQyxrQkFBa0IsRUFBRSwyREFBMkQ7aUJBQy9FLENBQUMsQ0FBQztnQkFFSCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQ3BEO2lCQUFNO2dCQUNOLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBRTdGLElBQUksU0FBUyxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM1QyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7b0JBQ3JELE9BQU8sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNwQjtxQkFBTTtvQkFDTixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7aUJBQ3BEO2FBQ0Q7U0FDRDthQUFNO1lBQ04sR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQ3RFO1FBRUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNmLE9BQU8sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3JCLENBQUM7Q0FDRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgaHR0cCBmcm9tIFwiaHR0cFwiO1xuaW1wb3J0ICogYXMgdnNlcnYgZnJvbSBcInZhbGUtc2VydmVyLWlpXCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRuYW1lOiBcImF1dGhcIixcblx0YWZ0ZXJzOiBbIF0sXG5cdGJlZm9yZXM6IFsgXCJmaXhcIiwgXCJkaXJlY3RvcnlcIiwgXCJzdGF0aWNcIiwgXCJlbmRcIiBdLFxuXHRfZnJvbUZpbGU6IHRydWUsXG5cdGJvZHk6IGFzeW5jIGZ1bmN0aW9uIGJvZHkocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSwgcmVzOiBodHRwLlNlcnZlclJlc3BvbnNlLCBldmVudDogdnNlcnYuQ2xhc3Nlcy5ldnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAoIWV2ZW50LmNhcnJpYWdlLl9nbG9iYWwucGF0aGVycikge1xuXG5cdFx0XHRyZXMuc2V0SGVhZGVyKFwiWC1Db250ZW50LVR5cGUtT3B0aW9uc1wiLCBcIm5vc25pZmZcIik7XG5cdFx0XHRyZXMuc2V0SGVhZGVyKFwiWC1YU1MtUHJvdGVjdGlvblwiLCBcIjE7IG1vZGU9YmxvY2tcIik7XG5cdFx0XHRyZXMuc2V0SGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcInByaXZhdGUsIG5vLXN0b3JlLCBtYXgtYWdlPTM2MDAsIG11c3QtcmV2YWxpZGF0ZVwiKTtcblx0XHRcdHJlcy5zZXRIZWFkZXIoXCJYLUZyYW1lLU9wdGlvbnNcIiwgXCJzYW1lb3JpZ2luXCIpO1xuXHRcdFx0cmVzLnNldEhlYWRlcihcIkNhY2hlLUNvbnRyb2xcIiwgXCJtYXgtYWdlPTEyMFwiKTtcblx0XHRcdHJlcy5zZXRIZWFkZXIoXCJWYXJ5XCIsIFwiVXNlci1BZ2VudFwiKTtcblxuXHRcdFx0aWYgKCFyZXEuaGVhZGVyc1tcImF1dGhvcml6YXRpb25cIl0pIHtcblx0XHRcdFx0cmVzLndyaXRlSGVhZCg0MDEsIGh0dHAuU1RBVFVTX0NPREVTWzQwMV0sIHtcblx0XHRcdFx0XHRcIldXVy1BdXRoZW50aWNhdGVcIjogJ0Jhc2ljIHJlYWxtPVwiQWNjZXNzIHRvIHRoZSBzdGFnaW5nIHNpdGVcIiwgY2hhcnNldD1cIlVURi04XCInXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGV2ZW50LnNlcnZlci5fZGVidWcoZXZlbnQucmVxY250ciwgXCIoQVVUSC5UUykgNDAxXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0IGNoYWxsZW5nZSA9IEJ1ZmZlci5mcm9tKHJlcS5oZWFkZXJzW1wiYXV0aG9yaXphdGlvblwiXS5zcGxpdCgnICcpWzFdLCBcImJhc2U2NFwiKS50b1N0cmluZygpO1xuXG5cdFx0XHRcdGlmIChjaGFsbGVuZ2UgPT09IGV2ZW50LnNlcnZlci5kYXRhW1wiYXV0aFwiXSkge1xuXHRcdFx0XHRcdGV2ZW50LnNlcnZlci5fZGVidWcoZXZlbnQucmVxY250ciwgXCIoQVVUSC5UUykgUEFTU1wiKTtcblx0XHRcdFx0XHRyZXR1cm4gZXZlbnQucGFzcygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlcy53cml0ZUhlYWQoNDAzLCBodHRwLlNUQVRVU19DT0RFU1s0MDNdKTtcblx0XHRcdFx0XHRldmVudC5zZXJ2ZXIuX2RlYnVnKGV2ZW50LnJlcWNudHIsIFwiKEFVVEguVFMpIDQwM1wiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXMud3JpdGVIZWFkKDQwMCwgaHR0cC5TVEFUVVNfQ09ERVNbNDAwXSwgeyBcIndhcm5pbmdcIjogXCJiYWQgcm9vdFwiIH0pO1xuXHRcdH1cblxuXHRcdHJlcy5lbmQoXCJFUlJcIik7XG5cdFx0cmV0dXJuIGV2ZW50LnN0b3AoKTtcblx0fVxufTtcbiJdfQ==