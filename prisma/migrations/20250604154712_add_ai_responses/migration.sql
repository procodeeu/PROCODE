-- CreateTable
CREATE TABLE "ai_responses" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "modelData" JSONB NOT NULL,
    "requestData" JSONB NOT NULL,
    "responseData" JSONB NOT NULL,
    "tokensUsed" JSONB,
    "cost" DECIMAL(10,8),
    "latency" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'success',
    "errorDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_responses_messageId_key" ON "ai_responses"("messageId");

-- AddForeignKey
ALTER TABLE "ai_responses" ADD CONSTRAINT "ai_responses_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
