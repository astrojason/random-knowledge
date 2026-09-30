import { expect, it } from "vitest";
import { publisherOf } from "./publisher";

it.each([
  ["https://www.example.com/a", "example.com"],
  ["https://en.wikipedia.org/wiki/X", "wikipedia.org"],
  ["https://simple.wikipedia.org/wiki/X", "wikipedia.org"],
  ["https://ncbi.nlm.nih.gov/pmc/1", "nih.gov"],
  ["https://www.nih.gov/x", "nih.gov"],
  ["https://news.bbc.co.uk/a", "bbc.co.uk"],
  ["https://www.abc.net.au/a", "abc.net.au"],
  ["https://museum.example/topic", "museum.example"],
  ["http://localhost/x", "localhost"],
])("treats %s as published by %s", (url, publisher) => {
  expect(publisherOf(url)).toBe(publisher);
});
