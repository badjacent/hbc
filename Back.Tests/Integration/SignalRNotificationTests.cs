using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Back.Data;
using Back.Dto;
using Back.Models;
using Back.Tests.Infrastructure;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.AspNetCore.TestHost;
using Xunit;

namespace Back.Tests.Integration;

public class SignalRNotificationTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;
    private HubConnection? _hubConnection;

    public SignalRNotificationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CustomerChange_IsBroadcastOverHub()
    {
        var tcs = new TaskCompletionSource<DataChangedEvent<Customer>>(TaskCreationOptions.RunContinuationsAsynchronously);

        _hubConnection!.On<DataChangedEvent<Customer>>("CustomerChanged", change =>
        {
            tcs.TrySetResult(change);
        });

        await _hubConnection.StartAsync();

        var newCustomer = new CreateCustomerRequest
        {
            FirstName = "Hub",
            MiddleInitial = "X",
            LastName = "Listener"
        };

        var response = await _client.PostAsJsonAsync("/api/customers", newCustomer);
        response.EnsureSuccessStatusCode();

        var completed = await Task.WhenAny(tcs.Task, Task.Delay(TimeSpan.FromSeconds(3)));
        Assert.Equal(tcs.Task, completed);

        var change = await tcs.Task;
        Assert.Equal(ChangeType.Added, change.Type);
        Assert.Equal(newCustomer.FirstName, change.Payload.FirstName);
    }

    public async Task InitializeAsync()
    {
        _hubConnection = new HubConnectionBuilder()
            .WithUrl(new Uri(_factory.Server.BaseAddress!, "/hubs/orders"), opts =>
            {
                opts.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
            })
            .Build();

        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        if (_hubConnection is not null)
        {
            await _hubConnection.DisposeAsync();
        }
    }
}
