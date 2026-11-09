-- Regras de integridade (equivalentes aos gatilhos do SQLite). Pode rodar varias vezes.
ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS review_rating_check;
ALTER TABLE "Review" ADD CONSTRAINT review_rating_check CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "Campaign" DROP CONSTRAINT IF EXISTS campaign_dates_check;
ALTER TABLE "Campaign" ADD CONSTRAINT campaign_dates_check CHECK ("startDate" <= "endDate");
