CREATE TABLE "BudgetSociale" (
	"id"	INTEGER NOT NULL,
	"amount"	INTEGER NOT NULL DEFAULT 0,
	"current_fase"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE TABLE "Proposal" (
	"id"	INTEGER,
	"user_id"	INTEGER NOT NULL,
	"description"	TEXT NOT NULL,
	"cost"	INTEGER NOT NULL,
	"approved"	INTEGER NOT NULL DEFAULT 0 CHECK("approved" IN (0, 1)),
	FOREIGN KEY("user_id") REFERENCES "User"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE TABLE "User" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"surname"	TEXT NOT NULL,
	"role"	TEXT NOT NULL CHECK("role" IN ('Admin', 'Member')),
	"username"	TEXT,
	"password"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE TABLE "Vote" (
	"user_id"	INTEGER,
	"proposal_id"	INTEGER NOT NULL,
	"score"	INTEGER NOT NULL CHECK("score" IN (0, 1, 2, 3)),
	FOREIGN KEY("proposal_id") REFERENCES "Proposal"("id"),
	FOREIGN KEY("user_id") REFERENCES "User"("id"),
	PRIMARY KEY("user_id","proposal_id")
)