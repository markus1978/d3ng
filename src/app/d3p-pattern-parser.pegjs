Pattern = head:Segment _ tail:("/" _ Segment)* {
  var result = [ head ], i;
  if (tail) {
    for (i = 0; i < tail.length; i++) {
      result.push(tail[i][2])
    }
  }
  return result;
}
Segment = negated:"!"? _ typeRef:TypeRef _ limit:Limit? _ notFlat:"+"? {
  var result = { type: typeRef };
  if (limit) {
    result["limit"] = limit;
  }
  result["flat"] = notFlat == null;
  return result;
}
Limit = negated:"!"? _ "[" _ typeNegated:"!"? _ typeRef:TypeRef _ "]" {
  var result = { type: typeRef };
  if (negated) result["isNegated"] = true;
  if (typeNegated) result["isTypeNegated"] = true;
  return result;
}

TypeRef = ID / "."
ID "id" = [a-zA-Z_][a-zA-Z0-9_]* { return text(); }

_ "whitespace"
  = [ \t\n\r]*
