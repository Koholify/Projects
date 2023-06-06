class Chess {
    constructor() {
        this.board = [];
        this.player = 'w'
        this.movelist = [];
        this.white = white;
        this.black = black;
        this.selected = null;
        this.validMoves = [];
        this.needUpdate = true;
        this.lastmove = 0;

        for(var i = 0; i < 8; i++){
            this.board.push([]);
            for(var j = 0; j < 8; j++) {
                this.board[i].push(null);
            }
        }

        pieces.forEach(p => {
            var f = p.position[0];
            var r = p.position[1];
            this.board[f][r] = p;
        });
    }

    getPlayer() { return this.player == 'w' ? this.white : this.black; }

    get(f, r) {
        if(arguments.length == 1){
            return this.board[f[0]][f[1]];
        } else {
            return this.board[f][r];
        }
    }
    isOOB(f,r) {
        if(arguments.length == 1) {
            return f[0] > 7 || f[1] > 7 || f[0] < 0 || f[1] < 0;
        } else {
            return f > 7 || r > 7 || f < 0 || r < 0;
        }
    }

    getNextMoves(piece) {
        var moves;
        if(piece == undefined) {
            moves = this.getNextMove(this.selected);
            this.validMoves = moves.filter(m => !this.checkForCheck(m, this.selected));
            return this.validMoves;
        } else {
            moves = this.getNextMove(piece);
            return moves.filter(m => !this.checkForCheck(m, piece));
        }
    }

    checkForCheck(m) {
        var player = game.player;
        var piece = game.selected;
        if(piece == null) return false;
        game.moveTo(piece, m[0], m[1]);
        var inCheck = game.isCheck(player);
        game.undoMove();
        game.selected = piece;
        return inCheck;
    }

    undoMove() {
        if(this.movelist.length == 0) return;
        var move = this.movelist.pop();
        this.moveTo(move.piece, move.from[0], move.from[1], false);
        move.piece.timesMoved--;
        if(move.kill) {
            move.kill.unkill();
            this.board[move.kill.position[0]][move.kill.position[1]] = move.kill;
        }
        if(move.castle != null) {
            console.log(move);
            this.moveTo(move.castle.piece, move.castle.from[0], move.castle.from[1], false);
            move.castle.piece.timesMoved--;
            this.player = this.player == 'w' ? 'b' : 'w';
        }
    }

    update() {
        if(this.needUpdate) {
            document.getElementById('check').innerText = game.isCheck(game.player) ? "CHECK" : "";
            this.lastmove = this.movelist.length;
            this.needUpdate = false;
        }

        if(this.lastmove != this.movelist.length) {
            this.needUpdate = true;
        }
    }

    getNextMove(piece) {
        var moves = [];
        switch (piece.type) {
            case 'p':
                moves = this.pawnMoves(piece);
                moves = moves.map(m => Chess.add(piece.position, m));
                break;
            case 'r':
                moves = this.rookMoves(piece);
                break;
            case 'b':
                moves = this.bishopMoves(piece);
                break;
            case 'q':
                moves = this.bishopMoves(piece).concat(this.rookMoves(piece));
                break;
            case 'k':
                moves = this.kingMoves(piece);
                break;
            case 'kn':
                moves = this.knightMoves(piece);
                break;
            default:
                break;
        }
        return moves;
    }

    isCheck(p) {
        var player = p == 'w' ? this.black : this.white
        var otherPlayer = p  == 'w' ? this.white : this.black;
        var check = player.all().some(p => {
            if(!p.active) return false;
            var moves = this.getNextMove(p);
            return moves.some(m => compare(m, otherPlayer.king.position));
        });
        return check;
    }

    moveTo(piece, f,r, add=true) {
        var move = {piece:piece, from:piece.position, kill:null, castle:null};
        this.selected = null;
        this.board[piece.position[0]][piece.position[1]] = null;

        if(this.board[f][r] != null) {
            this.board[f][r].kill();
            move.kill = this.board[f][r];
        }

        this.board[f][r] = piece;
        piece.move(f,r);
        if(add) {
            if (piece.type == 'k' && piece.timesMoved == 0) {
                var rank = piece.color == 'w' ? 0 : 7;
                if(r == rank && f == 2) {
                    var player = piece.color == 'w' ? this.white : this.black;
                    move.castle = {piece:player.rook[0], from:player.rook[0].position, kill:null};
                    player.rook[0].move(3, r);
                    this.board[0][r] = null;
                    this.board[3][r] = player.rook[0];
                    player.rook[0].timesMoved++;
                } else if (rank == r && f == 6) {
                    var player = piece.color == 'w' ? this.white : this.black;
                    move.castle = {piece:player.rook[1], from:player.rook[1].position, kill:null};
                    player.rook[1].move(5, r);
                    this.board[7][r] = null;
                    this.board[5][r] = player.rook[1];
                    player.rook[1].timesMoved++;
                }
            }
            piece.timesMoved++;
            this.movelist.push(move);
        }
        this.player = this.player == 'w' ? 'b' : 'w';
    }

    selectSquare(f,r) {
        if(f < 0 || r < 0) {
            this.selected = null;
        } else if (this.selected != null && compare(this.selected.position, [f,r])) {
            this.selected = null;
        } else if (this.selected != null && this.validMoves.some(m => compare(m, [f,r]))){
            this.moveTo(this.selected, f,r);
            this.selected = null;
        } else {
            this.selected = this.board[f][r];
        }
        this.validMoves = [];
    }

    static add(a, b) {return [a[0] + b[0], a[1] + b[1]]; }

    pawnMoves(piece) {
        const moves = piece.color == 'w' ? [[0,1], [0,2], [1,1], [-1,1]] : [[0,-1], [0,-2], [1,-1], [-1,-1]];
        var toReturn = [];
        var pos = piece.position;
        if(!this.isOOB(Chess.add(pos, moves[0])) && this.get(Chess.add(pos, moves[0])) == null) { toReturn.push(moves[0]); }
        if(!this.isOOB(Chess.add(pos, moves[1])) && this.get(Chess.add(pos, moves[1])) == null && pos[1] == (piece.color == 'w' ? 1 : 6)) { toReturn.push(moves[1]); }
        if(!this.isOOB(Chess.add(pos, moves[2])) && this.get(Chess.add(pos, moves[2])) != null && this.get(Chess.add(pos, moves[2])).color != piece.color) { toReturn.push(moves[2]); }
        if(!this.isOOB(Chess.add(pos, moves[3])) && this.get(Chess.add(pos, moves[3])) != null && this.get(Chess.add(pos, moves[3])).color != piece.color) { toReturn.push(moves[3]); }
        return toReturn;
    }

    rookMoves(piece) {
        const directions = [[1,0], [-1,0], [0,1], [0,-1]];
        var toReturn = [];
        directions.forEach(dir => {
            var pos = Chess.add(piece.position, dir);
            while(!this.isOOB(pos) && (this.get(pos) == null || this.get(pos).color != piece.color)) {
                toReturn.push(pos)
                if(this.get(pos) != null && this.get(pos).color != piece.color) {
                    break;
                }
                pos = Chess.add(pos, dir);
            }
        });
        return toReturn;
    }

    bishopMoves(piece) {
        const directions = [[1,1], [-1,1], [1,-1], [-1,-1]];
        var toReturn = [];
        directions.forEach(dir => {
            var pos = Chess.add(piece.position, dir);
            while(!this.isOOB(pos) && (this.get(pos) == null || this.get(pos).color != piece.color)) {
                toReturn.push(pos)
                if(this.get(pos) != null && this.get(pos).color != piece.color) {
                    break;
                }
                pos = Chess.add(pos, dir);
            }
        });
        return toReturn;
    }

    kingMoves(piece) {
        const moves = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,1], [1,-1], [-1,1]];
        var toReturn = [];
        moves.forEach(dir => {
            var pos = Chess.add(piece.position, dir);
            if(!this.isOOB(pos) && (this.get(pos) == null || this.get(pos).color != piece.color)) {
                toReturn.push(pos);
            }
        });
        var r = piece.color == 'w' ? 0 : 7;
        if(this.canCastleA(piece.color, r)) {
            var m = [2,r];
            toReturn.push(m);
        }
        if(this.canCastleH(piece.color, r)) {
            var m = [6,r];
            toReturn.push(m);
        }

        return toReturn;
    }

    knightMoves(piece) {
        const moves = [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [-1,2], [1,-2], [-1,-2]];
        var toReturn = [];
        moves.forEach(dir => {
            var pos = Chess.add(piece.position, dir);
            if(!this.isOOB(pos) && (this.get(pos) == null || this.get(pos).color != piece.color)) {
                toReturn.push(pos);
            }
        });
        return toReturn;
    }

    canCastleA(color, rank) {
        var player = color == 'w' ? this.white : this.black;
        if(player.king.timesMoved == 0 && player.rook[0].active && player.rook[0].timesMoved == 0 && this.board[3][rank] == null && this.board[2][rank] == null
            && [[3,rank], [2,rank]].every(m => this.checkForCheck(m, null))) return true;
        return false;
    }

    canCastleH(color, rank) {
        var player = color == 'w' ? this.white : this.black;
        if(player.king.timesMoved == 0 && player.rook[1].active && player.rook[1].timesMoved == 0 && this.board[5][rank] == null && this.board[6][rank] == null
            && [[5,rank], [6,rank]].every(m => this.checkForCheck(m, null))) return true;
        return false;
    }

}