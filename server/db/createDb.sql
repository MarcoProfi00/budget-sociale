CREATE TABLE "User" (
	id	INTEGER,
	name	TEXT NOT NULL,
	surname	TEXT NOT NULL,
	role	TEXT NOT NULL CHECK("role" IN ('Admin', 'Member')),
	username	TEXT,
	password	TEXT NOT NULL,
	salt	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE Proposal (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 description TEXT NOT NULL,
 cost INTEGER NOT NULL,
 FOREIGN KEY(user_id) REFERENCES User(id)
);

CREATE TABLE Vote (
    user_id INTEGER NOT NULL,
    proposal_id INTEGER NOT NULL,
    score INTEGER CHECK(score IN (1, 2, 3)) NOT NULL,
    PRIMARY KEY (user_id, proposal_id),
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (proposal_id) REFERENCES Proposal(id)
);
