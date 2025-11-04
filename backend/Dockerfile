# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o /app --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:5175 \
    ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5175
COPY --from=build /app ./
ENTRYPOINT ["dotnet","carco.dll"]


